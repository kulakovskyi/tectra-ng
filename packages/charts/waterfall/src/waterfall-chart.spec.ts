import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxWaterfallChart } from './waterfall-chart.component';
import { TxWaterfallBarEvent, TxWaterfallItem } from './waterfall-chart.types';
import { waterfallExtent, waterfallSteps } from './waterfall-layout';

@Component({
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart id="main" [items]="items()" [connectors]="connectors()" [pt]="{ bar: { class: 'own-bar' } }" (barClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxWaterfallItem[]>([
    { label: 'Start', value: 100 },
    { label: 'Sales', value: 40 },
    { label: 'Refunds', value: -25 },
    { label: 'Fees', value: -10 },
    { label: 'End', total: true },
  ]);
  readonly connectors = signal(true);
  readonly clicks: TxWaterfallBarEvent[] = [];
}

describe('waterfall layout', () => {
  it('keeps a running total and closes it with total bars', () => {
    const steps = waterfallSteps([{ label: 'A', value: 10 }, { label: 'B', value: -4 }, { label: 'Sum', total: true }, { label: 'C', value: null }]);
    expect(steps.map((step) => [step.kind, step.from, step.to])).toEqual([
      ['up', 0, 10],
      ['down', 10, 6],
      ['total', 0, 6],
      ['up', 6, 6],
    ]);
    expect(waterfallExtent(waterfallSteps([{ label: 'A', value: -5 }, { label: 'B', value: 12 }]))).toEqual([-5, 7]);
  });
});

describe('TxWaterfallChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws floating bars by kind with signed labels and connectors', () => {
    const bars = all('#main .tx-waterfall-chart__bar');
    expect(bars.map((bar) => bar.getAttribute('data-kind'))).toEqual(['up', 'up', 'down', 'down', 'total']);
    expect(bars[0].classList).toContain('own-bar');
    expect(all('#main .tx-waterfall-chart__label').map((label) => label.textContent?.trim())).toEqual(['+100', '+40', '−25', '−10', '105']);
    expect(all('#main .tx-waterfall-chart__connector')).toHaveLength(4);
    expect(Number(bars[2].getAttribute('y'))).toBeCloseTo(Number(bars[1].getAttribute('y')), 0);
    expect(all('#main .tx-chart-legend__item').map((item) => item.textContent?.trim())).toEqual(['Increase', 'Decrease', 'Total']);
    expect(el('#main .tx-chart-legend__item').tagName).toBe('SPAN');
    expect(plot().getAttribute('aria-label')).toBe('Waterfall chart, 1 series, 5 values, total 105');
  });

  it('drops the connectors', async () => {
    fixture.componentInstance.connectors.set(false);
    await fixture.whenStable();
    expect(all('#main .tx-waterfall-chart__connector')).toHaveLength(0);
    expect((fixture.debugElement.query(By.directive(TxWaterfallChart)).componentInstance as TxWaterfallChart).connectorLines()).toEqual([]);
  });

  it('reads the steps with the keyboard: the change and the running total', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-waterfall-chart__bar--active').getAttribute('data-index')).toBe('2');
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Refunds');
    expect(panel.textContent).toContain('−25');
    expect(panel.textContent).toContain('115');
  });

  it('reports the clicked step', () => {
    const bar = all('#main .tx-waterfall-chart__bar')[4];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 2, clientY: Number(bar.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 4, label: 'End', change: 105, total: 105, kind: 'total' });
  });
});

@Component({
  imports: [TxWaterfallChart, TxChartTooltipTemplate],
  template: `
    <tx-waterfall-chart [items]="items()" [dataLabels]="labels()" [ariaLabel]="ariaLabel()" [dt]="dt()" (barClick)="clicks.push($event)">
      @if (templates()) {
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.title }}</span></ng-template>
      }
    </tx-waterfall-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfigHost {
  readonly items = signal<TxWaterfallItem[] | null>([
    { label: 'Start', value: -20 },
    { label: 'Flat', value: 0 },
    { label: 'Sum', total: true },
  ]);
  readonly labels = signal(true);
  readonly ariaLabel = signal('');
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly templates = signal(false);
  readonly clicks: TxWaterfallBarEvent[] = [];
}

describe('TxWaterfallChart options', () => {
  let fixture: ComponentFixture<ConfigHost>;
  let host: ConfigHost;
  const chart = () => fixture.debugElement.query(By.directive(TxWaterfallChart)).componentInstance as TxWaterfallChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConfigHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('shows the empty state without items and ignores the keyboard', async () => {
    host.items.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(chart().summary()).toBe('Waterfall chart, 1 series, 0 values');
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(chart().active()).toBeNull();
  });

  it('labels a zero change without a sign and hangs negative labels below', () => {
    expect(all('.tx-waterfall-chart__label').map((label) => label.textContent?.trim())).toEqual(['−20', '0', '-20']);
    const [start, , sum] = chart().bars();
    expect(start.above).toBe(false);
    expect(start.textY).toBeGreaterThan(start.y + start.height);
    expect(sum.above).toBe(false);
  });

  it('drops the labels and keeps the legend for several kinds only', async () => {
    expect(all('.tx-chart-legend__item').map((item) => item.textContent?.trim())).toEqual(['Increase', 'Decrease', 'Total']);
    host.labels.set(false);
    host.items.set([
      { label: 'A', value: 3 },
      { label: 'B', value: 4 },
    ]);
    await fixture.whenStable();
    expect(all('.tx-waterfall-chart__label')).toHaveLength(0);
    expect(all('.tx-chart-legend__item')).toHaveLength(0);
  });

  it('prefixes the summary with the aria label', async () => {
    host.ariaLabel.set('Cash');
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toBe('Cash. Waterfall chart, 1 series, 3 values, total -20');
  });

  it('pins the tooltip under falling bars and announces totals', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowRight');
    expect(chart().tooltip()).toMatchObject({ title: 'Start', placement: 'bottom' });
    expect(announce).toHaveBeenLastCalledWith('Start: −20, total -20');
    await key('End');
    expect(chart().tooltip()?.rows.map((row) => [row.label, row.value])).toEqual([['Total', '-20']]);
    expect(announce).toHaveBeenLastCalledWith('Sum: Total -20');
    await key('Escape');
    expect(chart().active()).toBeNull();
  });

  it('forgets a step that no longer exists', async () => {
    await key('End');
    host.items.set([{ label: 'Only', value: 1 }]);
    await fixture.whenStable();
    expect(chart().active()).toBe(2);
    expect(chart().tooltip()).toBeNull();
  });

  it('tracks the pointer inside the plot only and clears on leave', async () => {
    const bar = chart().bars()[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: bar.x + bar.width / 2, clientY: chart().layout().plot.top + 2, bubbles: true }));
    await fixture.whenStable();
    expect(host.clicks).toEqual([{ index: 1, label: 'Flat', change: 0, total: -20, kind: 'up' }]);
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: -40, clientY: -40, bubbles: true }));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: bar.x + 1, clientY: chart().layout().plot.top + 2, bubbles: true }));
    await fixture.whenStable();
    expect(chart().active()).toBe(1);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('renders an own tooltip template', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    await key('ArrowRight');
    expect(document.querySelector('.own-tooltip')?.textContent).toBe('Start');
  });

  it('reads the bar width from the tokens', async () => {
    host.dt.set({ bar: { width: '0.3' } });
    await fixture.whenStable();
    expect(chart().barWidth()).toBe(0.3);
  });
});

describe('TxWaterfallChart recompiled by TestBed', () => {
  it('still renders its bars when a test overrides the component', async () => {
    TestBed.overrideComponent(TxWaterfallChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-waterfall-chart__bar').length).toBeGreaterThan(0);
  });
});
