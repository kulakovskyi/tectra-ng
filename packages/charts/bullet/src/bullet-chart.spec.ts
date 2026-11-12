import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxBulletChart } from './bullet-chart.component';
import { TxBulletEvent, TxBulletItem } from './bullet-chart.types';
import { bulletMax, bulletSegments } from './bullet-layout';

@Component({
  imports: [TxBulletChart],
  template: `<tx-bullet-chart id="main" [items]="items()" [ranges]="[50, 80]" [max]="100" [pt]="{ bar: { class: 'own-bar' } }" (barClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxBulletItem[]>([
    { label: 'Revenue', value: 72, target: 85 },
    { label: 'Profit', value: 40, target: 30, ranges: [20, 35, 60] },
    { label: 'Orders', value: null },
  ]);
  readonly clicks: TxBulletEvent[] = [];
}

describe('bullet layout', () => {
  it('splits the scale into qualitative ranges, the last one the lightest', () => {
    expect(bulletSegments([50, 80], 0, 100, 3)).toEqual([
      { level: 1, from: 0, to: 50 },
      { level: 2, from: 50, to: 80 },
      { level: 3, from: 80, to: 100 },
    ]);
    expect(bulletSegments([60, 30], 0, 100, 3).map((segment) => [segment.level, segment.to])).toEqual([
      [1, 30],
      [2, 60],
      [3, 100],
    ]);
    expect(bulletSegments([], 0, 10, 3)).toEqual([{ level: 3, from: 0, to: 10 }]);
    expect(bulletMax([3, null, 12, undefined])).toBe(12);
  });
});

describe('TxBulletChart', () => {
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

  it('draws a row per item with ranges, a value bar and a target', () => {
    expect(all('#main .tx-bullet-chart__row')).toHaveLength(3);
    expect(all('#main .tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label').map((label) => label.textContent?.trim())).toEqual(['Revenue', 'Profit', 'Orders']);
    expect(all('#main .tx-bullet-chart__row[data-index="0"] .tx-bullet-chart__range').map((range) => range.getAttribute('data-level'))).toEqual(['1', '2', '3']);
    expect(all('#main .tx-bullet-chart__row[data-index="1"] .tx-bullet-chart__range')).toHaveLength(4);
    expect(all('#main .tx-bullet-chart__bar')).toHaveLength(2);
    expect(el('#main .tx-bullet-chart__bar').classList).toContain('own-bar');
    expect(all('#main .tx-bullet-chart__target')).toHaveLength(2);
    const bar = el('#main .tx-bullet-chart__bar');
    const target = el('#main .tx-bullet-chart__target');
    expect(Number(target.getAttribute('x1'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')));
    expect(el('#main .tx-chart-frame').style.height).toBe('162px');
    expect(plot().getAttribute('aria-label')).toBe('Bullet chart, 1 series, 3 values');
  });

  it('walks the rows with the keyboard and shows the value and the target', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-bullet-chart__row--active').getAttribute('data-index')).toBe('1');
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Profit');
    expect(panel.textContent).toContain('Target');
    expect(panel.textContent).toContain('30');
  });

  it('reports the clicked row', () => {
    const bar = all('#main .tx-bullet-chart__bar')[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 2, clientY: Number(bar.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 1, label: 'Profit', value: 40, target: 30 });
  });
});

@Component({
  imports: [TxBulletChart, TxChartTooltipTemplate],
  template: `
    <tx-bullet-chart [items]="items()" [ranges]="[40]" [ariaLabel]="ariaLabel()" [dt]="dt()" (barClick)="clicks.push($event)">
      @if (templates()) {
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.title }}</span></ng-template>
      }
    </tx-bullet-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfigHost {
  readonly items = signal<TxBulletItem[] | null>([
    { label: 'Plain', value: 30 },
    { label: 'Own', value: null, target: 120, ranges: [60, 90] },
  ]);
  readonly ariaLabel = signal('');
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly templates = signal(false);
  readonly clicks: TxBulletEvent[] = [];
}

describe('TxBulletChart options', () => {
  let fixture: ComponentFixture<ConfigHost>;
  let host: ConfigHost;
  const chart = () => fixture.debugElement.query(By.directive(TxBulletChart)).componentInstance as TxBulletChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: 'pointermove' | 'click', x: number, y: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
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
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(chart().active()).toBeNull();
  });

  it('fits the scale to values, targets and own or shared ranges', () => {
    expect(chart().domainMax()).toBe(120);
    expect(chart().rows()[0].ranges.map((range) => range.level)).toEqual([2, 3]);
    expect(chart().rows()[1].ranges.map((range) => range.level)).toEqual([1, 2, 3]);
  });

  it('prefixes the summary with the aria label', async () => {
    host.ariaLabel.set('Goals');
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toBe('Goals. Bullet chart, 1 series, 2 values');
  });

  it('reads rows upwards and announces missing values and targets', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowUp');
    expect(chart().active()).toBe(1);
    expect(announce).toHaveBeenLastCalledWith('Own: —, target 120');
    expect(chart().tooltip()?.rows.map((row) => [row.label, row.value])).toEqual([
      ['Value', '—'],
      ['Target', '120'],
    ]);
    await key('ArrowUp');
    expect(chart().active()).toBe(0);
    expect(announce).toHaveBeenLastCalledWith('Plain: 30');
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['Value']);
    await key('Escape');
    expect(chart().active()).toBeNull();
  });

  it('forgets a row that no longer exists', async () => {
    await key('End');
    host.items.set([{ label: 'Only', value: 1 }]);
    await fixture.whenStable();
    expect(chart().active()).toBe(1);
    expect(chart().tooltip()).toBeNull();
  });

  it('tracks the pointer inside the plot only and clears on leave', async () => {
    const row = chart().rows()[1];
    const x = chart().layout().plot.left + 4;
    await pointer('click', x, row.center);
    expect(host.clicks).toEqual([{ index: 1, label: 'Own', value: null, target: 120 }]);
    await pointer('pointermove', x, -40);
    expect(chart().active()).toBeNull();
    await pointer('pointermove', x, row.center);
    expect(chart().active()).toBe(1);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('renders an own tooltip template', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    await key('ArrowDown');
    expect(document.querySelector('.own-tooltip')?.textContent).toBe('Plain');
  });

  it('reads the row geometry from the tokens', async () => {
    host.dt.set({ bullet: { rowHeight: '60', trackHeight: '0.6', barHeight: '0.4', targetHeight: '0.8' } });
    await fixture.whenStable();
    expect(chart().geometry()).toEqual({ rowHeight: 60, trackHeight: 0.6, barHeight: 0.4, targetHeight: 0.8 });
    expect(el('.tx-chart-frame').style.height).toBe(`${2 * 60 + 30}px`);
  });
});

describe('TxBulletChart recompiled by TestBed', () => {
  it('still renders its bars when a test overrides the component', async () => {
    TestBed.overrideComponent(TxBulletChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-bullet-chart__bar').length).toBeGreaterThan(0);
  });
});
