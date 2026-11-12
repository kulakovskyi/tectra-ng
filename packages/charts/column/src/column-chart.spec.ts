import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TxChartAnnotation,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartSeries,
  TxChartTooltipFormatter,
  TxChartTooltipMode,
  TxChartTooltipTemplate,
  bandScale,
  linearScale,
  stackValues,
} from '@tectra-ng/charts/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxColumnChart } from './column-chart.component';
import { TxColumnChartPointEvent, TxColumnChartSeriesToggle } from './column-chart.types';
import { columnBars } from './column-layout';

@Component({
  imports: [TxColumnChart],
  template: `
    <tx-column-chart
      id="main"
      [series]="series()"
      [categories]="['Mon', 'Tue', 'Wed']"
      [stacked]="stacked()"
      [stackType]="stackType()"
      [horizontal]="horizontal()"
      [dataLabels]="labels()"
      [pt]="{ bar: { class: 'own-bar' } }"
      (barClick)="clicks.push($event)"
    />
    <tx-column-chart id="negative" [series]="[{ name: 'Flow', data: [5, -3] }]" [categories]="['A', 'B']" />
    <tx-column-chart id="fill" height="100%" [series]="[{ name: 'A', data: [1] }]" [categories]="['A']" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxChartSeries[]>([
    { name: 'Opened', data: [4, 5, 3] },
    { name: 'Closed', data: [2, null, 1] },
  ]);
  readonly stacked = signal(true);
  readonly stackType = signal<'normal' | '100%'>('normal');
  readonly horizontal = signal(false);
  readonly labels = signal(false);
  readonly clicks: TxColumnChartPointEvent[] = [];
}

describe('columnBars', () => {
  it('stacks bars and rounds only the outer end', () => {
    const values = [
      [4, -2],
      [3, -1],
    ];
    const bars = columnBars({
      band: bandScale(2, [0, 200]),
      value: linearScale([-4, 8], [120, 0]),
      horizontal: false,
      stacked: true,
      widthRatio: 0.5,
      groupGap: 2,
      values,
      stackedValues: stackValues(values),
      visible: [0, 1],
      colors: [],
      labels: (value) => String(value),
      labelFontSize: 11,
    });
    expect(bars).toHaveLength(4);
    expect(bars.map((bar) => bar.end)).toEqual([null, null, 'top', 'bottom']);
    expect(bars[0].width).toBe(50);
    expect(bars[0].x).toBe(25);
    expect(bars[0].label).toBe('4');
  });

  it('groups bars side by side', () => {
    const bars = columnBars({
      band: bandScale(1, [0, 100]),
      value: linearScale([0, 10], [100, 0]),
      horizontal: true,
      stacked: false,
      widthRatio: 1,
      groupGap: 0,
      values: [[5], [10]],
      stackedValues: [],
      visible: [0, 1],
      colors: ['red'],
      labels: null,
      labelFontSize: 11,
    });
    expect(bars.map((bar) => [bar.y, bar.height, bar.end, bar.color])).toEqual([
      [0, 50, 'right', 'red'],
      [50, 50, 'right', 'var(--tx-chart-series-color2)'],
    ]);
  });

  const grouped = (domain: [number, number], values: (number | null)[][]) =>
    columnBars({
      band: bandScale(values[0].length, [0, 100]),
      value: linearScale(domain, [100, 0]),
      horizontal: false,
      stacked: false,
      widthRatio: 1,
      groupGap: 0,
      values,
      stackedValues: [],
      visible: values.map((_, index) => index),
      colors: [],
      labels: null,
      labelFontSize: 11,
    });

  it('grows bars from the nearest domain edge when zero is outside it', () => {
    expect(grouped([2, 10], [[6]]).map((bar) => [bar.y, bar.height])).toEqual([[50, 50]]);
    expect(grouped([-10, -2], [[-6]]).map((bar) => [bar.y, bar.height, bar.end])).toEqual([[0, 50, 'bottom']]);
  });

  it('skips empty bars and missing series', () => {
    expect(grouped([0, 10], [[0, 5]]).map((bar) => bar.index)).toEqual([1]);
    const bars = columnBars({
      band: bandScale(1, [0, 100]),
      value: linearScale([0, 10], [100, 0]),
      horizontal: false,
      stacked: true,
      widthRatio: 1,
      groupGap: 0,
      values: [[4]],
      stackedValues: [],
      visible: [0, 1],
      colors: [],
      labels: null,
      labelFontSize: 11,
    });
    expect(bars).toEqual([]);
  });
});

describe('TxColumnChart', () => {
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

  it('stacks the series by default', () => {
    const bars = all('#main .tx-column-chart__bar');
    expect(bars).toHaveLength(5);
    expect(bars.filter((bar) => bar.getAttribute('data-end') === 'top').map((bar) => bar.getAttribute('data-index'))).toEqual(['1', '0', '2']);
    expect(bars[0].classList).toContain('own-bar');
    expect(plot().getAttribute('aria-label')).toBe('Column chart, 2 series, 3 values, from 1 to 5');
  });

  it('groups, turns horizontal and writes data labels', async () => {
    fixture.componentInstance.stacked.set(false);
    fixture.componentInstance.labels.set(true);
    await fixture.whenStable();
    const bars = all('#main .tx-column-chart__bar');
    expect(bars.every((bar) => bar.getAttribute('data-end') === 'top')).toBe(true);
    expect(all('#main .tx-column-chart__label').map((label) => label.textContent?.trim())).toContain('5');
    fixture.componentInstance.horizontal.set(true);
    await fixture.whenStable();
    expect(el('#main').getAttribute('data-orientation')).toBe('horizontal');
    expect(el('#main .tx-column-chart__bar').getAttribute('data-end')).toBe('right');
    expect(el('#main .tx-chart-axes__axis[data-position="left"]').textContent).toContain('Mon');
  });

  it('shows 100% stacks in percent', async () => {
    fixture.componentInstance.stackType.set('100%');
    await fixture.whenStable();
    expect(el('#main .tx-chart-axes__axis[data-position="left"]').textContent).toContain('100%');
  });

  it('grows negative bars down from the zero line', () => {
    expect(el('#negative .tx-chart-axes__zero')).not.toBeNull();
    expect(all('#negative .tx-column-chart__bar').map((bar) => bar.getAttribute('data-end'))).toEqual(['top', 'bottom']);
  });

  it('fills its parent with a string height', () => {
    expect(el('#fill').classList).toContain('tx-column-chart--fill');
    expect(el('#fill .tx-chart-frame').style.height).toBe('100%');
  });

  it('reads the columns with the keyboard and pins the tooltip above the column', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-column-chart--active');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Mon');
    expect(panel.getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/);
    expect(panel.querySelector('.tx-chart-frame__tooltip-total')?.textContent).toContain('6');
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(all('#main .tx-column-chart__bar--active')).toHaveLength(2);
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-column-chart--active');
  });

  it('reacts anywhere in the category and lays a band under it', async () => {
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 20, bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-column-chart--active');
    expect(el('#main .tx-chart-hover-band')).toBeNull();
    const bar = all('#main .tx-column-chart__bar').find((item) => item.getAttribute('data-index') === '1') as HTMLElement;
    const center = Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')) / 2;
    plot().dispatchEvent(new MouseEvent('pointermove', { clientX: center, clientY: Number(bar.getAttribute('y')) - 30, bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-column-chart--active');
    const band = el('#main .tx-chart-hover-band');
    expect(band.classList).toContain('tx-chart-hover-band--on');
    expect(Number(band.getAttribute('x'))).toBeLessThan(Number(bar.getAttribute('x')));
    expect(Number(band.getAttribute('x')) + Number(band.getAttribute('width'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(el('#main .tx-chart-hover-band').classList).not.toContain('tx-chart-hover-band--on');
  });

  it('reports the clicked bar', async () => {
    const bar = all('#main .tx-column-chart__bar').find((item) => item.getAttribute('data-index') === '1') as SVGRectElement & HTMLElement;
    const x = Number(bar.getAttribute('x')) + 2;
    const y = Number(bar.getAttribute('y')) + 2;
    plot().dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ seriesIndex: 0, dataPointIndex: 1, value: 5, category: 'Tue' });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#main .tx-column-chart__bar')).toHaveLength(3);
  });
});

@Component({
  imports: [TxColumnChart, TxChartLegendTemplate, TxChartTooltipTemplate],
  template: `
    <tx-column-chart
      [series]="series()"
      [categories]="categories()"
      [stacked]="stacked()"
      [stackType]="stackType()"
      [horizontal]="horizontal()"
      [dataLabels]="labels()"
      [tooltipMode]="tooltipMode()"
      [tooltipFormatter]="formatter()"
      [legendVariant]="legendVariant()"
      [annotations]="annotations()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      (barClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    >
      @if (templates()) {
        <ng-template txChartLegend let-item><span class="own-legend">{{ item.label }}</span></ng-template>
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.title }}</span></ng-template>
      }
    </tx-column-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfigHost {
  readonly series = signal<TxChartSeries[] | null>([
    { name: 'Opened', data: [4, 5, null] },
    { name: 'Closed', data: [2, 3, null] },
  ]);
  readonly categories = signal<string[] | null>(['Mon', 'Tue', 'Wed']);
  readonly stacked = signal(true);
  readonly stackType = signal<'normal' | '100%'>('normal');
  readonly horizontal = signal(false);
  readonly labels = signal(false);
  readonly tooltipMode = signal<TxChartTooltipMode>('shared');
  readonly formatter = signal<TxChartTooltipFormatter | null>(null);
  readonly legendVariant = signal<TxChartLegendVariant>('dot');
  readonly annotations = signal<TxChartAnnotation[]>([]);
  readonly ariaLabel = signal('');
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly templates = signal(false);
  readonly clicks: TxColumnChartPointEvent[] = [];
  readonly toggles: TxColumnChartSeriesToggle[] = [];
}

describe('TxColumnChart options', () => {
  let fixture: ComponentFixture<ConfigHost>;
  let host: ConfigHost;
  const chart = () => fixture.debugElement.query(By.directive(TxColumnChart)).componentInstance as TxColumnChart;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const bar = (series: number, index: number) => el(`.tx-column-chart__bar[data-series="${series}"][data-index="${index}"]`);
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

  it('shows the empty state for missing series and categories', async () => {
    host.series.set(null);
    host.categories.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(chart().summary()).toContain('Column chart');
    expect(chart().summary()).not.toContain('from');
  });

  it('prefixes the summary with the aria label', async () => {
    host.ariaLabel.set('Tickets');
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toMatch(/^Tickets\. Column chart/);
  });

  it('keeps a unit value axis when every grouped series is hidden', async () => {
    host.stacked.set(false);
    await fixture.whenStable();
    all('.tx-chart-legend__item')[0].click();
    all('.tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('.tx-column-chart__bar')).toHaveLength(0);
    expect(host.toggles.map((toggle) => [toggle.seriesIndex, toggle.name, toggle.hidden])).toEqual([
      [0, 'Opened', true],
      [1, 'Closed', true],
    ]);
    expect(chart().valueExtent()).toEqual([0, 1]);
    await pointer('pointermove', chart().band().center(1), chart().layout().plot.top + 1);
    expect(chart().active()).toMatchObject({ index: 1, series: -1 });
    await key('Escape');
    await key('ArrowRight');
    expect(chart().active()).toBeNull();
  });

  it('formats values with a custom tooltip formatter', async () => {
    host.formatter.set((value, context) => `${value} @${context.seriesIndex}/${context.dataPointIndex}`);
    await fixture.whenStable();
    await key('ArrowRight');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('4 @0/0');
    expect(panel.textContent).toContain('2 @1/0');
  });

  it('writes percent labels on a 100% stack', async () => {
    host.stackType.set('100%');
    host.labels.set(true);
    await fixture.whenStable();
    const labels = all('.tx-column-chart__label').map((label) => label.textContent?.trim());
    expect(labels).toEqual(['66.7%', '62.5%', '33.3%', '37.5%']);
  });

  it('places grouped labels outside short horizontal and negative bars', async () => {
    host.series.set([
      { name: 'Up', data: [60, 1, 2] },
      { name: 'Down', data: [-60, -1, -2] },
    ]);
    host.stacked.set(false);
    host.labels.set(true);
    await fixture.whenStable();
    const negative = bar(1, 0);
    const label = all('.tx-column-chart__label').find((item) => item.textContent?.trim() === '-60') as HTMLElement;
    expect(negative.getAttribute('data-end')).toBe('bottom');
    expect(label).toBeDefined();
    host.horizontal.set(true);
    await fixture.whenStable();
    expect(bar(1, 0).getAttribute('data-end')).toBe('left');
    const anchors = all('.tx-column-chart__label').map((item) => item.getAttribute('text-anchor'));
    expect(anchors).toContain('end');
    expect(anchors).toContain('start');
  });

  it('pins the tooltip below negative columns and left of it when horizontal', async () => {
    host.series.set([
      { name: 'A', data: [-4, 2] },
      { name: 'B', data: [-2, 1] },
    ]);
    host.categories.set(['One', 'Two']);
    host.stacked.set(false);
    await fixture.whenStable();
    await key('ArrowRight');
    expect(chart().tooltip()).toMatchObject({ title: 'One', placement: 'bottom', total: undefined });
    host.horizontal.set(true);
    await fixture.whenStable();
    expect(chart().tooltip()).toMatchObject({ placement: 'left' });
    await key('ArrowDown');
    expect(chart().active()?.index).toBe(1);
    expect(chart().tooltip()).toMatchObject({ title: 'Two', placement: 'right' });
    await key('ArrowRight');
    expect(chart().active()?.series).toBe(1);
    await key('ArrowLeft');
    expect(chart().active()?.series).toBe(0);
  });

  it('cycles the series upwards and announces empty values', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ index: 0, series: 1, keyboard: true });
    await key('End');
    expect(chart().active()?.index).toBe(2);
    expect(announce).toHaveBeenLastCalledWith('Closed, Wed: —');
    expect(chart().tooltip()).toBeNull();
  });

  it('drops the tooltip over a category of zero values', async () => {
    host.series.set([{ name: 'Flat', data: [0, 2] }]);
    host.stacked.set(false);
    await fixture.whenStable();
    await key('ArrowRight');
    expect(chart().active()).toMatchObject({ index: 0, series: 0 });
    expect(chart().tooltip()).toBeNull();
    await key('ArrowRight');
    expect(chart().tooltip()?.title).toBe('Tue');
  });

  it('shows one row in single tooltip mode and highlights one bar', async () => {
    host.tooltipMode.set('single');
    host.stacked.set(false);
    await fixture.whenStable();
    await key('ArrowRight');
    await key('ArrowDown');
    expect(all('.tx-column-chart__bar--active').map((item) => item.getAttribute('data-series'))).toEqual(['1']);
    const tooltip = chart().tooltip();
    expect(tooltip?.rows.map((row) => row.label)).toEqual(['Closed']);
    expect(tooltip?.total).toBeUndefined();
    const active = bar(1, 0);
    expect(tooltip?.y).toBe(Number(active.getAttribute('y')));
  });

  it('picks the nearest grouped bar off the bars and the last stacked one above a stack', async () => {
    host.stacked.set(false);
    await fixture.whenStable();
    const left = bar(0, 0);
    const right = bar(1, 0);
    const top = chart().layout().plot.top + 1;
    await pointer('pointermove', Number(right.getAttribute('x')) + Number(right.getAttribute('width')) - 1, top);
    expect(chart().active()).toMatchObject({ index: 0, series: 1 });
    await pointer('pointermove', Number(left.getAttribute('x')) + 1, top);
    expect(chart().active()).toMatchObject({ index: 0, series: 0 });
    host.horizontal.set(true);
    await fixture.whenStable();
    const lower = bar(1, 1);
    await pointer('click', Number(lower.getAttribute('x')) + Number(lower.getAttribute('width')) + 20, Number(lower.getAttribute('y')) + 1);
    expect(host.clicks.at(-1)).toMatchObject({ seriesIndex: 1, dataPointIndex: 1, value: 3, category: 'Tue' });
    host.horizontal.set(false);
    host.stacked.set(true);
    await fixture.whenStable();
    await pointer('pointermove', chart().band().center(2), top);
    expect(chart().active()).toMatchObject({ index: 2, series: 0 });
  });

  it('focuses a series on legend hover unless it is hidden', async () => {
    const items = all('.tx-chart-legend__item');
    items[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(el('.tx-column-chart').classList).toContain('tx-column-chart--focused');
    expect(all('.tx-column-chart__bar--focused').every((item) => item.getAttribute('data-series') === '1')).toBe(true);
    items[1].dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(el('.tx-column-chart').classList).not.toContain('tx-column-chart--focused');
    items[1].click();
    await fixture.whenStable();
    items[1].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBeNull();
  });

  it('shows totals and the active value in a stat legend', async () => {
    host.legendVariant.set('stat');
    await fixture.whenStable();
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['9', '5']);
    expect(all('.tx-chart-legend__caption')[0].textContent).toContain('Total');
    await key('End');
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['—', '—']);
    expect(all('.tx-chart-legend__caption')[0].textContent).toContain('Wed');
    expect(chart().tooltip()).toBeNull();
  });

  it('draws annotations on categories and values and skips unknown ones', async () => {
    host.annotations.set([
      { type: 'x-line', x: 'Tue', label: 'Release' },
      { type: 'x-line', x: 'Sun' },
      { type: 'x-band', from: 'Mon', to: 'Tue' },
      { type: 'x-band', from: 'Sun', to: 'Tue' },
      { type: 'y-line', y: 3 },
    ]);
    await fixture.whenStable();
    const shapes = chart().annotationShapes();
    expect(shapes.map((shape) => shape.kind)).toEqual(['line', 'band', 'line']);
    expect(shapes[0].x1).toBe(chart().band().center(1));
    expect(el('.tx-chart-annotation__label').textContent).toContain('Release');
    expect(all('.tx-chart-annotation__band')).toHaveLength(1);
  });

  it('renders own legend and tooltip templates', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    expect(all('.own-legend').map((item) => item.textContent)).toEqual(['Opened', 'Closed']);
    await key('ArrowRight');
    expect(document.querySelector('.own-tooltip')?.textContent).toBe('Mon');
  });

  it('reads the bar geometry from the tokens', async () => {
    const before = Number(bar(0, 0).getAttribute('width'));
    host.dt.set({ bar: { width: '0.28', horizontalWidth: '0.3', groupGap: '6' } });
    await fixture.whenStable();
    expect(chart().geometry()).toEqual({ width: 0.28, horizontalWidth: 0.3, gap: 6 });
    expect(Number(bar(0, 0).getAttribute('width'))).toBeCloseTo(before / 2, 5);
  });
});

describe('TxColumnChart recompiled by TestBed', () => {
  it('still renders its bars when a test overrides the component', async () => {
    TestBed.overrideComponent(TxColumnChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-column-chart__bar').length).toBeGreaterThan(0);
  });
});
