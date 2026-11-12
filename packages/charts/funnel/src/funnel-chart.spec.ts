import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxFunnelChart } from './funnel-chart.component';
import { TxFunnelItem, TxFunnelStageEvent } from './funnel-chart.types';
import { funnelBoxes, funnelConnectorPath, funnelIndexAt, funnelRate } from './funnel-layout';

@Component({
  imports: [TxFunnelChart],
  template: `
    <tx-funnel-chart id="main" [items]="items()" [colorful]="colorful()" [pt]="{ stage: { class: 'own-stage' } }" (stageClick)="clicks.push($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxFunnelItem[]>([
    { label: 'Visits', value: 1000 },
    { label: 'Sign-ups', value: 400 },
    { label: 'Trials', value: 120 },
    { label: 'Paid', value: 30 },
  ]);
  readonly colorful = signal(false);
  readonly clicks: TxFunnelStageEvent[] = [];
}

describe('funnel layout', () => {
  it('centres bars sized by the biggest value with gaps between rows', () => {
    const boxes = funnelBoxes({ values: [100, 50], left: 0, width: 200, top: 0, height: 120, gapRatio: 0.4, minWidth: 4 });
    expect(boxes).toEqual([
      { index: 0, value: 100, x: 0, y: 0, width: 200, height: 50 },
      { index: 1, value: 50, x: 50, y: 70, width: 100, height: 50 },
    ]);
    expect(funnelConnectorPath(boxes[0], boxes[1])).toBe('M0,50L200,50L150,70L50,70Z');
    expect(funnelRate(25, 200)).toBe(12.5);
    expect(funnelRate(5, 0)).toBe(0);
    expect(funnelIndexAt(boxes, 10)).toBe(0);
    expect(funnelIndexAt(boxes, 64)).toBe(1);
    expect(funnelIndexAt(boxes, 130)).toBe(-1);
  });

  it('handles no rows, all-zero values and a single row', () => {
    expect(funnelBoxes({ values: [], left: 0, width: 200, top: 0, height: 100, gapRatio: 0.4, minWidth: 4 })).toEqual([]);
    expect(funnelBoxes({ values: [0, 0], left: 0, width: 200, top: 0, height: 120, gapRatio: 0.4, minWidth: 4 }).map((box) => [box.x, box.width])).toEqual([
      [98, 4],
      [98, 4],
    ]);
    expect(funnelIndexAt([], 10)).toBe(-1);
    const single = funnelBoxes({ values: [10], left: 0, width: 100, top: 0, height: 40, gapRatio: 0.4, minWidth: 4 });
    expect(funnelIndexAt(single, 39)).toBe(0);
  });
});

describe('TxFunnelChart', () => {
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

  it('draws one stage per step with labels, values and conversions', () => {
    const stages = all('#main .tx-funnel-chart__stage');
    expect(stages).toHaveLength(4);
    expect(stages[0].classList).toContain('own-stage');
    expect(Number(stages[1].getAttribute('width'))).toBeCloseTo(Number(stages[0].getAttribute('width')) * 0.4, 0);
    expect(all('#main .tx-funnel-chart__label').map((label) => label.textContent?.trim())).toEqual(['Visits', 'Sign-ups', 'Trials', 'Paid']);
    expect(all('#main .tx-funnel-chart__value').map((value) => value.textContent?.trim())).toEqual(['1,000', '400', '120', '30']);
    expect(all('#main .tx-funnel-chart__conversion').map((value) => value.textContent?.trim())).toEqual(['40%', '30%', '25%']);
    expect(all('#main .tx-funnel-chart__connector')).toHaveLength(3);
    expect(new Set(stages.map((stage) => stage.style.fill)).size).toBe(1);
    expect(plot().getAttribute('aria-label')).toBe('Funnel chart, 1 series, 4 values, conversion 3%');
  });

  it('gives every stage its own colour', async () => {
    fixture.componentInstance.colorful.set(true);
    await fixture.whenStable();
    expect(new Set(all('#main .tx-funnel-chart__stage').map((stage) => stage.style.fill)).size).toBe(4);
  });

  it('walks the stages with the keyboard and shows the conversion', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-funnel-chart__stage--active').getAttribute('data-index')).toBe('1');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Sign-ups');
    expect(panel.textContent).toContain('Of first');
    expect(panel.textContent).toContain('40%');
  });

  it('reports the clicked stage', () => {
    const stage = all('#main .tx-funnel-chart__stage')[2];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(stage.getAttribute('x')) + 1, clientY: Number(stage.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 2, label: 'Trials', value: 120, ofFirst: 12, conversion: 30 });
  });
});

@Component({
  imports: [TxFunnelChart, TxChartTooltipTemplate],
  template: `
    <tx-funnel-chart
      [items]="items()"
      [showLabels]="showLabels()"
      [showTooltip]="showTooltip()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      (stageClick)="clicks.push($event)"
    >
      @if (template()) {
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.rows[0].label }}</span></ng-template>
      }
    </tx-funnel-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly items = signal<TxFunnelItem[] | null>([
    { label: 'Visits', value: 200 },
    { label: 'Leads', value: null },
    { label: 'Paid', value: Number.NaN },
  ]);
  readonly showLabels = signal(true);
  readonly showTooltip = signal(true);
  readonly ariaLabel = signal('');
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly template = signal(false);
  readonly clicks: TxFunnelStageEvent[] = [];
}

describe('TxFunnelChart options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const chart = () => fixture.debugElement.query(By.directive(TxFunnelChart)).componentInstance as TxFunnelChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('treats missing and non-finite values as zero', () => {
    expect(chart().values()).toEqual([200, 0, 0]);
    expect(all('.tx-funnel-chart__value').map((value) => value.textContent?.trim())).toEqual(['200', '0', '0']);
  });

  it('shows the empty state without items', async () => {
    host.items.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(chart().stages()).toEqual([]);
    expect(chart().summary()).toBe('Funnel chart, 1 series, 0 values');
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(chart().active()).toBeNull();
  });

  it('drops the label column when labels are off', async () => {
    const left = Number(el('.tx-funnel-chart__stage').getAttribute('x'));
    host.showLabels.set(false);
    await fixture.whenStable();
    expect(chart().labelColumn()).toBe(0);
    expect(all('.tx-funnel-chart__label')).toHaveLength(0);
    expect(Number(el('.tx-funnel-chart__stage').getAttribute('x'))).toBeLessThan(left);
  });

  it('describes a single stage without a conversion rate and with the aria label', async () => {
    host.items.set([{ label: 'Visits', value: 50 }]);
    host.ariaLabel.set('Traffic');
    await fixture.whenStable();
    expect(chart().gapHeight()).toBe(0);
    expect(plot().getAttribute('aria-label')).toBe('Traffic. Funnel chart, 1 series, 1 value');
    await key('ArrowDown');
    expect(panel()?.textContent).toContain('Visits');
    expect(panel()?.textContent).not.toContain('Of first');
    expect(panel()?.textContent).not.toContain('Conversion');
  });

  it('walks up, ignores other keys and closes with Escape', async () => {
    await key('ArrowUp');
    expect(chart().active()).toBe(2);
    await key('ArrowLeft');
    expect(chart().active()).toBe(1);
    await key('ArrowRight');
    expect(chart().active()).toBe(2);
    await key('Home');
    expect(chart().active()).toBe(0);
    expect(panel()?.textContent).toContain('Visits');
    expect(panel()?.textContent).not.toContain('Of first');
    await key('Escape');
    expect(chart().active()).toBeNull();
  });

  it('hovers stages, forgets them outside the funnel and on leave', async () => {
    const stage = all('.tx-funnel-chart__stage')[0];
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: Number(stage.getAttribute('y')) + 2, bubbles: true }));
    await fixture.whenStable();
    expect(chart().active()).toBe(0);
    plot().dispatchEvent(new MouseEvent('click', { clientX: 10, clientY: 10000, bubbles: true }));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
    expect(host.clicks).toEqual([]);
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: Number(stage.getAttribute('y')) + 2, bubbles: true }));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('drops a stale stage after the data shrinks and keeps the tooltip off when asked', async () => {
    await key('End');
    expect(chart().tooltip()).not.toBeNull();
    host.items.set([{ label: 'Visits', value: 200 }]);
    await fixture.whenStable();
    expect(chart().tooltip()).toBeNull();
    host.showTooltip.set(false);
    await key('Home');
    expect(chart().active()).toBe(0);
    expect(chart().tooltip()).toBeNull();
  });

  it('renders its own tooltip template', async () => {
    host.template.set(true);
    await fixture.whenStable();
    await key('Home');
    expect(panel()?.querySelector('.own-tooltip')?.textContent).toBe('Visits');
  });

  it('reads the row gap and font sizes from the tokens', async () => {
    const before = chart().geometry();
    host.dt.set({ funnel: { rowGap: '0.8', labelFontSize: '20px' } } as TectraDeepPartial<TectraChartTokens>);
    await fixture.whenStable();
    expect(chart().geometry()).toEqual({ ...before, gap: 0.8, labelFontSize: 20 });
    expect(chart().gapHeight()).toBeGreaterThan(0);
  });
});

describe('TxFunnelChart recompiled by TestBed', () => {
  it('still renders its stages and tooltip template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxFunnelChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(OptionsHost);
    fixture.componentInstance.template.set(true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tx-funnel-chart__stage')).toHaveLength(3);
    fixture.nativeElement.querySelector('.tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(document.querySelector('.tx-chart-frame__tooltip .own-tooltip')?.textContent).toBe('Visits');
    document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = ''));
  });
});
