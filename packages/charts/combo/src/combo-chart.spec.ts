import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TxChartAnnotation,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartTooltipFormatter,
  TxChartTooltipMode,
  TxChartTooltipTemplate,
  bandScale,
  linearScale,
  stackValues,
} from '@tectra-ng/charts/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxComboChart } from './combo-chart.component';
import { TxComboChartPointEvent, TxComboChartSeries, TxComboChartSeriesToggle } from './combo-chart.types';
import { comboBars, comboSlots } from './combo-layout';

@Component({
  imports: [TxComboChart],
  template: `
    <tx-combo-chart
      id="main"
      [series]="series()"
      [categories]="['Jan', 'Feb', 'Mar']"
      [stacked]="stacked()"
      y2ValueFormat="percent"
      y2AxisTitle="Margin"
      [pt]="{ bar: { class: 'own-bar' }, line: { class: 'own-line' } }"
      (pointClick)="clicks.push($event)"
    />
    <tx-combo-chart id="single" [series]="[{ name: 'Visits', data: [3, 4], type: 'area' }]" [categories]="['A', 'B']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxComboChartSeries[]>([
    { name: 'Revenue', data: [40, 52, 61] },
    { name: 'Costs', data: [28, 30, 35] },
    { name: 'Margin', data: [30, 42, 43], type: 'line', axis: 'secondary' },
  ]);
  readonly stacked = signal(false);
  readonly clicks: TxComboChartPointEvent[] = [];
}

describe('comboBars', () => {
  it('gives every column series its own slot, or one slot per axis when stacked', () => {
    expect([...comboSlots([0, 2, 3], [0, 0, 1, 1], false).entries()]).toEqual([
      [0, 0],
      [2, 1],
      [3, 2],
    ]);
    expect([...comboSlots([0, 2, 3], [0, 0, 1, 0], true).entries()]).toEqual([
      [0, 0],
      [2, 1],
      [3, 0],
    ]);
  });

  it('maps each bar with the scale of its axis', () => {
    const bars = comboBars({
      band: bandScale(1, [0, 100]),
      scales: [linearScale([0, 10], [100, 0]), linearScale([0, 1000], [100, 0])],
      axes: [0, 1],
      stacked: false,
      widthRatio: 1,
      groupGap: 0,
      values: [[5], [500]],
      stackedValues: [],
      columns: [0, 1],
      colors: [],
    });
    expect(bars.map((bar) => [bar.x, bar.y, bar.width, bar.height, bar.end])).toEqual([
      [0, 50, 50, 50, 'top'],
      [50, 50, 50, 50, 'top'],
    ]);
  });

  it('puts columns without an axis into the first slot', () => {
    expect([...comboSlots([0, 1], [], true).entries()]).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });

  it('rounds only the outer end of each stack and skips empty entries', () => {
    const values = [
      [4, null, -3, 2],
      [2, 1, -2, null],
      [5, 5, 5, 5],
    ];
    const bars = comboBars({
      band: bandScale(4, [0, 400]),
      scales: [linearScale([-6, 6], [120, 0])],
      axes: [0, 0, 1],
      stacked: true,
      widthRatio: 0.5,
      groupGap: 0,
      values,
      stackedValues: stackValues(values.slice(0, 2)),
      columns: [0, 1, 2, 3],
      colors: [],
    });
    expect(bars.map((bar) => [bar.key, bar.end, bar.dir])).toEqual([
      ['0:0', null, 'up'],
      ['0:2', null, 'down'],
      ['0:3', 'top', 'up'],
      ['1:0', 'top', 'up'],
      ['1:1', 'top', 'up'],
      ['1:2', 'bottom', 'down'],
    ]);
  });

  it('grows grouped columns from the nearest domain edge when zero is outside it', () => {
    const at = (domain: [number, number], value: number) =>
      comboBars({
        band: bandScale(1, [0, 100]),
        scales: [linearScale(domain, [100, 0])],
        axes: [0],
        stacked: false,
        widthRatio: 1,
        groupGap: 0,
        values: [[value]],
        stackedValues: [],
        columns: [0],
        colors: [],
      }).map((bar) => [bar.y, bar.height, bar.dir]);
    expect(at([2, 10], 6)).toEqual([[50, 50, 'up']]);
    expect(at([-10, -2], -6)).toEqual([[0, 50, 'down']]);
  });
});

describe('TxComboChart', () => {
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

  it('draws grouped columns and a line on a second axis', () => {
    expect(all('#main .tx-combo-chart__bar')).toHaveLength(6);
    expect(all('#main .tx-combo-chart__bar')[0].classList).toContain('own-bar');
    expect(all('#main .tx-combo-chart__line')).toHaveLength(1);
    expect(el('#main .tx-combo-chart__line').classList).toContain('own-line');
    expect(all('#main .tx-combo-chart__point')).toHaveLength(3);
    const right = el('#main .tx-chart-axes__axis[data-position="right"]');
    expect(right.textContent).toContain('%');
    expect(right.textContent).toContain('Margin');
    expect(all('#main .tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label')).toHaveLength(
      all('#main .tx-chart-axes__axis[data-position="right"] .tx-chart-axes__label').length,
    );
    expect(plot().getAttribute('aria-label')).toBe('Combo chart, 3 series, 3 values');
  });

  it('marks line series with a line in the legend', () => {
    expect(all('#main .tx-chart-legend__item').map((item) => item.getAttribute('data-marker'))).toEqual(['dot', 'dot', 'line']);
  });

  it('stacks the columns', async () => {
    fixture.componentInstance.stacked.set(true);
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-combo-chart--stacked');
    expect(all('#main .tx-combo-chart__bar').filter((bar) => bar.getAttribute('data-end') === 'top')).toHaveLength(3);
    const first = all('#main .tx-combo-chart__bar').filter((bar) => bar.getAttribute('data-index') === '0');
    expect(first[0].getAttribute('x')).toBe(first[1].getAttribute('x'));
  });

  it('reads the categories with the keyboard and formats every series by its axis', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-combo-chart--active');
    expect(all('#main .tx-combo-chart__bar--active')).toHaveLength(2);
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    expect(all('#main .tx-combo-chart__marker')).toHaveLength(1);
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Jan');
    expect(panel.textContent).toContain('30%');
    expect(panel.textContent).toContain('40');
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-combo-chart--active');
  });

  it('reports the clicked column', async () => {
    const bar = all('#main .tx-combo-chart__bar').find((item) => item.getAttribute('data-index') === '1' && item.getAttribute('data-series') === '0') as HTMLElement;
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 1, clientY: Number(bar.getAttribute('y')) + Number(bar.getAttribute('height')) - 1, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, value: 52, category: 'Feb' });
  });

  it('hides a series from the legend and drops the second axis with it', async () => {
    all('#main .tx-chart-legend__item')[2].click();
    await fixture.whenStable();
    expect(all('#main .tx-combo-chart__line')).toHaveLength(0);
    all('#main .tx-chart-legend__item')[0].click();
    await fixture.whenStable();
    expect(all('#main .tx-combo-chart__bar')).toHaveLength(3);
  });

  it('draws an area series on its own without a legend', () => {
    expect(all('#single .tx-combo-chart__area')).toHaveLength(1);
    expect(all('#single .tx-chart-legend__item')).toHaveLength(0);
    expect(el('#single .tx-chart-axes__axis[data-position="right"]')).toBeNull();
  });
});

@Component({
  imports: [TxComboChart, TxChartLegendTemplate, TxChartTooltipTemplate],
  template: `
    <tx-combo-chart
      [series]="series()"
      [categories]="categories()"
      [stacked]="stacked()"
      [markers]="markers()"
      [tooltipMode]="tooltipMode()"
      [tooltipFormatter]="formatter()"
      [legendVariant]="legendVariant()"
      [annotations]="annotations()"
      [ariaLabel]="ariaLabel()"
      [y2Min]="y2Min()"
      [dt]="dt()"
      (pointClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    >
      @if (templates()) {
        <ng-template txChartLegend let-item><span class="own-legend">{{ item.label }}</span></ng-template>
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.title }}</span></ng-template>
      }
    </tx-combo-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfigHost {
  readonly series = signal<TxComboChartSeries[] | null>([
    { name: 'Revenue', data: [40, 52, null, 0] },
    { name: 'Trend', data: [30, null, 20, 10], type: 'line' },
    { name: 'Share', data: [20, 30, null, 40], type: 'area', axis: 'secondary' },
  ]);
  readonly categories = signal<string[] | null>(['Jan', 'Feb', 'Mar', 'Apr']);
  readonly stacked = signal(false);
  readonly markers = signal(true);
  readonly tooltipMode = signal<TxChartTooltipMode>('shared');
  readonly formatter = signal<TxChartTooltipFormatter | null>(null);
  readonly legendVariant = signal<TxChartLegendVariant>('dot');
  readonly annotations = signal<TxChartAnnotation[]>([]);
  readonly ariaLabel = signal('');
  readonly y2Min = signal<number | undefined>(undefined);
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly templates = signal(false);
  readonly clicks: TxComboChartPointEvent[] = [];
  readonly toggles: TxComboChartSeriesToggle[] = [];
}

describe('TxComboChart options', () => {
  let fixture: ComponentFixture<ConfigHost>;
  let host: ConfigHost;
  const chart = () => fixture.debugElement.query(By.directive(TxComboChart)).componentInstance as TxComboChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: 'pointermove' | 'click', x: number, y: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
    await fixture.whenStable();
  };
  const legend = (index: number) => all('.tx-chart-legend__item')[index];

  beforeEach(async () => {
    fixture = TestBed.createComponent(ConfigHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('shows the empty state for missing series and categories', async () => {
    host.series.set(null);
    host.categories.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
  });

  it('prefixes the summary with the aria label', async () => {
    host.ariaLabel.set('Sales');
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toBe('Sales. Combo chart, 3 series, 4 values');
  });

  it('breaks lines and areas at gaps and fills areas down to the axis minimum', async () => {
    host.y2Min.set(10);
    await fixture.whenStable();
    expect(el('.tx-combo-chart__area').getAttribute('d')).toContain('M');
    expect(all('.tx-combo-chart__line')).toHaveLength(2);
    expect(all('.tx-combo-chart__point')).toHaveLength(6);
    expect(chart().scales()[1].domain[0]).toBe(10);
    host.markers.set(false);
    await fixture.whenStable();
    expect(all('.tx-combo-chart__point')).toHaveLength(0);
  });

  it('keeps unit axes when every series of an axis is hidden', async () => {
    legend(0).click();
    legend(1).click();
    await fixture.whenStable();
    expect(chart().layout().value.domain).toEqual([0, 1]);
    legend(2).click();
    await fixture.whenStable();
    expect(chart().layout().secondaryValue?.domain).toEqual([0, 1]);
    expect(host.toggles.map((toggle) => toggle.name)).toEqual(['Revenue', 'Trend', 'Share']);
    await pointer('pointermove', chart().band().center(1), chart().layout().plot.top + 1);
    expect(chart().active()).toMatchObject({ index: 1, series: -1 });
    await key('Escape');
    await key('ArrowRight');
    expect(chart().active()).toBeNull();
  });

  it('formats values with a custom tooltip formatter', async () => {
    host.formatter.set((value, context) => `${value} @${context.seriesIndex}`);
    await fixture.whenStable();
    await key('ArrowRight');
    expect(document.querySelector('.tx-chart-frame__tooltip')?.textContent).toContain('30 @1');
  });

  it('cycles the series with the vertical arrows and announces gaps', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowDown');
    expect(chart().active()).toMatchObject({ index: 0, series: 1 });
    await key('ArrowUp');
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ index: 0, series: 2 });
    await key('ArrowRight');
    await key('ArrowRight');
    expect(announce).toHaveBeenLastCalledWith('Share, Mar: —');
  });

  it('shows one series in single tooltip mode', async () => {
    host.tooltipMode.set('single');
    await fixture.whenStable();
    await key('ArrowRight');
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['Revenue']);
    expect(all('.tx-combo-chart__bar--active')).toHaveLength(1);
    expect(all('.tx-combo-chart__marker')).toHaveLength(0);
    await key('ArrowDown');
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['Trend']);
    expect(all('.tx-combo-chart__marker')).toHaveLength(1);
    await key('End');
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ index: 3, series: 0 });
    expect(chart().tooltip()).toMatchObject({ title: 'Apr', y: chart().layout().plot.top });
  });

  it('drops the tooltip where every series is empty', async () => {
    host.series.set([
      { name: 'A', data: [1, null] },
      { name: 'B', data: [2, null], type: 'line' },
    ]);
    host.categories.set(['One', 'Two']);
    await fixture.whenStable();
    await key('End');
    expect(chart().active()?.index).toBe(1);
    expect(chart().tooltip()).toBeNull();
  });

  it('picks the nearest line point, the hit column, or the last column', async () => {
    const trend = chart().scales()[0].map(30);
    await pointer('pointermove', chart().band().center(0), trend);
    expect(chart().active()).toMatchObject({ index: 0, series: 1, pointerY: trend });
    const bar = el('.tx-combo-chart__bar[data-series="0"][data-index="1"]');
    await pointer('click', Number(bar.getAttribute('x')) + 1, Number(bar.getAttribute('y')) + Number(bar.getAttribute('height')) - 1);
    expect(host.clicks.at(-1)).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, value: 52, category: 'Feb' });
    legend(1).click();
    legend(2).click();
    await fixture.whenStable();
    await pointer('pointermove', chart().band().center(1), chart().layout().plot.top + 1);
    expect(chart().active()).toMatchObject({ index: 1, series: 0 });
    await pointer('pointermove', chart().band().center(2), chart().layout().plot.top + 1);
    expect(chart().active()).toMatchObject({ index: 2, series: 0 });
    await pointer('pointermove', -50, -50);
    expect(chart().active()).toBeNull();
    await pointer('pointermove', chart().band().center(0), chart().layout().plot.top + 1);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('focuses a series on legend hover unless it is hidden', async () => {
    legend(1).dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('.tx-combo-chart').classList).toContain('tx-combo-chart--focused');
    expect(el('.tx-combo-chart__series--focused').getAttribute('data-series')).toBe('1');
    legend(1).dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBeNull();
    legend(1).click();
    await fixture.whenStable();
    legend(1).dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBeNull();
  });

  it('shows column totals, last line values and the active value in a stat legend', async () => {
    host.legendVariant.set('stat');
    await fixture.whenStable();
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['92', '10', '40']);
    await key('ArrowRight');
    await key('ArrowRight');
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['52', '—', '30']);
    expect(all('.tx-chart-legend__caption')[0].textContent).toContain('Feb');
    expect(chart().tooltip()).toBeNull();
    host.series.set([
      { name: 'A', data: [1] },
      { name: 'B', data: [null], type: 'line' },
    ]);
    host.categories.set(['One']);
    await fixture.whenStable();
    await key('Escape');
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['1', '—']);
  });

  it('draws annotations on categories and both axes and skips unknown ones', async () => {
    host.annotations.set([
      { type: 'x-line', x: 'Feb' },
      { type: 'x-line', x: 'Dec' },
      { type: 'x-band', from: 'Jan', to: 'Feb' },
      { type: 'x-band', from: 'Dec', to: 'Feb' },
      { type: 'y-line', y: 30 },
      { type: 'y-line', y: 0.25, axis: 'secondary' },
    ]);
    await fixture.whenStable();
    const shapes = chart().annotationShapes();
    expect(shapes.map((shape) => shape.kind)).toEqual(['line', 'band', 'line', 'line']);
    expect(shapes[0].x1).toBe(chart().band().center(1));
    expect(shapes[2].y1).toBe(chart().scales()[0].map(30));
    expect(shapes[3].y1).toBe(chart().scales()[1].map(0.25));
  });

  it('renders own legend and tooltip templates', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    expect(all('.own-legend').map((item) => item.textContent)).toEqual(['Revenue', 'Trend', 'Share']);
    await key('ArrowRight');
    expect(document.querySelector('.own-tooltip')?.textContent).toBe('Jan');
  });

  it('reads the bar geometry from the tokens', async () => {
    host.dt.set({ bar: { width: '0.3', groupGap: '6' } });
    await fixture.whenStable();
    expect(chart().geometry()).toEqual({ width: 0.3, gap: 6 });
  });
});

describe('TxComboChart recompiled by TestBed', () => {
  it('still renders its bars when a test overrides the component', async () => {
    TestBed.overrideComponent(TxComboChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-combo-chart__bar').length).toBeGreaterThan(0);
  });
});
