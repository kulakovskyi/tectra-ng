import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  TxChartAnnotation,
  TxChartLegendTemplate,
  TxChartLegendVariant,
  TxChartTooltipTemplate,
  TxChartXAxisPosition,
  TxChartYAxisPosition,
  TxValueScaleKind,
} from '@tectra-ng/charts/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TectraChartTokens, TectraDeepPartial } from '@tectra-ng/themes';
import { TxScatterChart } from './scatter-chart.component';
import { TxScatterChartPointEvent, TxScatterChartSeriesToggle, TxScatterChartXType, TxScatterSeries } from './scatter-chart.types';
import { bubbleRadius, linearTrend, nearestDot, scatterData } from './scatter-layout';

@Component({
  imports: [TxScatterChart],
  template: `
    <tx-scatter-chart
      id="main"
      [series]="series()"
      [trendLine]="trend()"
      xAxisTitle="Height"
      yAxisTitle="Weight"
      [pt]="{ point: { class: 'own-point' } }"
      (pointClick)="clicks.push($event)"
    />
    <tx-scatter-chart id="bubble" [series]="bubbles" sizeLabel="Population" />
    <tx-scatter-chart id="time" xType="time" [series]="[{ name: 'Deploys', data: [{ x: '2026-01-05', y: 3 }, { x: '2026-03-10', y: 8 }] }]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly series = signal<TxScatterSeries[]>([
    { name: 'Group A', data: [{ x: 160, y: 55 }, { x: 172, y: 68, label: 'Max' }, [181, 80], { x: 168, y: null }] },
    { name: 'Group B', data: [[150, 48], [158, 52], [165, 60]], color: 'red' },
  ]);
  readonly trend = signal(false);
  readonly bubbles: TxScatterSeries[] = [
    { name: 'Cities', data: [{ x: 1, y: 2, size: 100 }, { x: 2, y: 3, size: 25 }, { x: 3, y: 1 }] },
  ];
  readonly clicks: TxScatterChartPointEvent[] = [];
}

describe('scatter layout', () => {
  it('reads objects and tuples and drops empty values', () => {
    const [points] = scatterData([{ name: 'A', data: [{ x: 1, y: 2, label: 'a' }, [3, 4, 9], { x: 'bad', y: 1 }, { x: 5, y: null }] }]);
    expect(points.map((point) => [point.index, point.x, point.y, point.size, point.label])).toEqual([
      [0, 1, 2, null, 'a'],
      [1, 3, 4, 9, null],
    ]);
  });

  it('sizes bubbles by area and fits a trend line', () => {
    expect(bubbleRadius(100, 100, 4, 20)).toBe(20);
    expect(bubbleRadius(25, 100, 4, 20)).toBe(10);
    expect(bubbleRadius(0.1, 100, 4, 20)).toBe(4);
    expect(bubbleRadius(null, 100, 4, 20)).toBe(4);
    expect(linearTrend([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }])).toEqual({ slope: 2, intercept: 1, from: 0, to: 2 });
    expect(linearTrend([{ x: 1, y: 1 }, { x: 1, y: 2 }])).toBeNull();
  });

  it('finds the nearest dot within its radius and the slack', () => {
    const dots = [
      { cx: 10, cy: 10, r: 4 },
      { cx: 40, cy: 10, r: 20 },
    ];
    expect(nearestDot(dots, 12, 12, 8)).toBe(dots[0]);
    expect(nearestDot(dots, 60, 10, 8)).toBe(dots[1]);
    expect(nearestDot(dots, 10, 60, 8)).toBeNull();
  });

  it('prefers the smaller dot at the same distance', () => {
    const dots = [
      { cx: 0, cy: 0, r: 10 },
      { cx: 0, cy: 0, r: 4 },
      { cx: 0, cy: 0, r: 8 },
    ];
    expect(nearestDot(dots, 1, 0, 8)).toBe(dots[1]);
  });
});

describe('TxScatterChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');
  const key = (name: string) => plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws one dot per value on linear axes', () => {
    const dots = all('#main .tx-scatter-chart__point');
    expect(dots).toHaveLength(6);
    expect(dots[0].classList).toContain('own-point');
    expect(dots[0].getAttribute('r')).toBe('5');
    expect(dots[3].style.getPropertyValue('--tx-scatter-chart-color')).toBe('red');
    expect(el('#main .tx-chart-axes__axis[data-position="bottom"]').textContent).toContain('Height');
    expect(plot().getAttribute('aria-label')).toBe('Scatter chart, 2 series, 6 values, from 48 to 80');
  });

  it('draws bubbles by size, the biggest first', () => {
    const dots = all('#bubble .tx-scatter-chart__point');
    expect(el('#bubble').classList).toContain('tx-scatter-chart--bubble');
    expect(dots.map((dot) => Number(dot.getAttribute('r')))).toEqual([26, 13, 4]);
    expect(el('#bubble .tx-chart-frame__plot').getAttribute('aria-label')).toContain('Bubble chart');
  });

  it('puts dates on a time axis', () => {
    expect(all('#time .tx-scatter-chart__point')).toHaveLength(2);
    expect(el('#time .tx-chart-axes__axis[data-position="bottom"]').textContent).toMatch(/Feb|Mar/);
  });

  it('adds a trend line per series', async () => {
    fixture.componentInstance.trend.set(true);
    await fixture.whenStable();
    expect(all('#main .tx-scatter-chart__trend')).toHaveLength(2);
  });

  it('walks the points by x with the arrows and switches series', async () => {
    key('ArrowRight');
    await fixture.whenStable();
    const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel().textContent).toContain('Group A');
    expect(panel().textContent).toContain('160');
    expect(el('#main .tx-scatter-chart__point--active').getAttribute('data-series')).toBe('0');
    expect(all('#main .tx-scatter-chart__guide')).toHaveLength(2);
    key('ArrowRight');
    await fixture.whenStable();
    expect(panel().textContent).toContain('Max');
    key('ArrowDown');
    await fixture.whenStable();
    expect(panel().textContent).toContain('Group B');
    expect(panel().textContent).toContain('165');
    key('Escape');
    await fixture.whenStable();
    expect(el('#main').classList).not.toContain('tx-scatter-chart--active');
  });

  it('shows the size in the bubble tooltip', async () => {
    el('#bubble .tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Population');
    expect(panel.textContent).toContain('100');
  });

  it('reports the clicked point', () => {
    const dot = all('#main .tx-scatter-chart__point').find((item) => item.getAttribute('data-series') === '0' && item.getAttribute('data-index') === '1') as HTMLElement;
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(dot.getAttribute('cx')) + 1, clientY: Number(dot.getAttribute('cy')), bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ seriesIndex: 0, dataPointIndex: 1, x: 172, y: 68, size: null, label: 'Max' });
  });

  it('hides a series from the legend', async () => {
    all('#main .tx-chart-legend__item')[1].click();
    await fixture.whenStable();
    expect(all('#main .tx-scatter-chart__point')).toHaveLength(3);
  });
});

@Component({
  imports: [TxScatterChart, TxChartLegendTemplate, TxChartTooltipTemplate],
  template: `
    <tx-scatter-chart
      [series]="series()"
      [xType]="xType()"
      [xMin]="xMin()"
      [xMax]="xMax()"
      [yScale]="yScale()"
      [xValueFormat]="xFormat()"
      [trendLine]="trend()"
      [legendVariant]="legendVariant()"
      [annotations]="annotations()"
      [ariaLabel]="ariaLabel()"
      [xAxisPosition]="xAxisPosition()"
      [yAxisPosition]="yAxisPosition()"
      [dt]="dt()"
      (pointClick)="clicks.push($event)"
      (seriesToggle)="toggles.push($event)"
    >
      @if (templates()) {
        <ng-template txChartLegend let-item><span class="own-legend">{{ item.label }}</span></ng-template>
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.rows[0].label }}</span></ng-template>
      }
    </tx-scatter-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ConfigHost {
  readonly series = signal<TxScatterSeries[] | null>([
    { name: 'A', data: [{ x: 2, y: 5 }, { x: 1, y: 4, label: 'First' }, { x: 2, y: 3 }] },
    { name: 'B', data: [[3, 6]] },
  ]);
  readonly xType = signal<TxScatterChartXType>('linear');
  readonly xMin = signal<number | undefined>(undefined);
  readonly xMax = signal<number | undefined>(undefined);
  readonly yScale = signal<TxValueScaleKind>('linear');
  readonly xFormat = signal<'number' | 'percent'>('number');
  readonly trend = signal(false);
  readonly legendVariant = signal<TxChartLegendVariant>('dot');
  readonly annotations = signal<TxChartAnnotation[]>([]);
  readonly ariaLabel = signal('');
  readonly xAxisPosition = signal<TxChartXAxisPosition>('bottom');
  readonly yAxisPosition = signal<TxChartYAxisPosition>('left');
  readonly dt = signal<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly templates = signal(false);
  readonly clicks: TxScatterChartPointEvent[] = [];
  readonly toggles: TxScatterChartSeriesToggle[] = [];
}

describe('TxScatterChart options', () => {
  let fixture: ComponentFixture<ConfigHost>;
  let host: ConfigHost;
  const chart = () => fixture.debugElement.query(By.directive(TxScatterChart)).componentInstance as TxScatterChart;
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

  it('shows the empty state for missing or empty series', async () => {
    host.series.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    host.series.set([{ name: 'Gaps', data: [{ x: 1, y: null }] }]);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(chart().xDomain()).toEqual([0, 1]);
    expect(chart().summary()).not.toContain('from');
  });

  it('prefixes the summary with the aria label', async () => {
    host.ariaLabel.set('Sizes');
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toMatch(/^Sizes\. Scatter chart/);
  });

  it('orders points by x and then y for the keyboard', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    expect(chart().order()[0]).toEqual([1, 2, 0]);
    await key('ArrowRight');
    expect(announce).toHaveBeenLastCalledWith('A, First: y 4');
    await key('ArrowRight');
    expect(announce).toHaveBeenLastCalledWith('A, x 2: y 3');
  });

  it('jumps to the first point of the previous series from nothing and to the closest x', async () => {
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ series: 1, index: 0 });
    await key('ArrowUp');
    expect(chart().active()).toMatchObject({ series: 0, index: 2 });
  });

  it('keeps the domain of all points while every series is hidden and ignores the keyboard', async () => {
    const domain = chart().xDomain();
    legend(0).click();
    legend(1).click();
    await fixture.whenStable();
    expect(chart().xDomain()).toEqual(domain);
    expect(chart().yExtent()).toEqual([0, 1]);
    expect(host.toggles.map((toggle) => toggle.hidden)).toEqual([true, true]);
    await key('ArrowRight');
    expect(chart().active()).toBeNull();
  });

  it('drops the active point when its series is hidden', async () => {
    await key('ArrowRight');
    expect(chart().active()?.series).toBe(0);
    legend(1).click();
    await fixture.whenStable();
    expect(chart().active()?.series).toBe(0);
    legend(0).click();
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('forgets an active point that no longer exists', async () => {
    await key('ArrowRight');
    await key('ArrowRight');
    expect(chart().active()?.index).toBe(2);
    expect(chart().activeDot()).not.toBeNull();
    host.series.set([{ name: 'A', data: [{ x: 1, y: 1 }] }]);
    await fixture.whenStable();
    expect(chart().activeDot()).toBeNull();
    expect(chart().guides()).toBeNull();
  });

  it('honours fixed time bounds and widens a single day', async () => {
    const day = Date.UTC(2026, 0, 5);
    host.series.set([{ name: 'Once', data: [{ x: day, y: 2 }] }]);
    host.xType.set('time');
    await fixture.whenStable();
    expect(chart().xDomain()).toEqual([day, day + 86_400_000]);
    host.xMin.set(day - 1000);
    host.xMax.set(day + 1000);
    await fixture.whenStable();
    expect(chart().xDomain()).toEqual([day - 1000, day + 1000]);
  });

  it('keeps fixed linear bounds and formats the x axis', async () => {
    host.xMin.set(-5);
    host.xMax.set(10);
    host.xFormat.set('percent');
    await fixture.whenStable();
    expect(chart().xDomain()).toEqual([-5, 10]);
    expect(el('.tx-chart-axes__axis[data-position="bottom"]').textContent).toContain('%');
  });

  it('does not pad a log value axis', async () => {
    host.yScale.set('log');
    await fixture.whenStable();
    expect(chart().yExtent()).toEqual([3, 6]);
  });

  it('pads bubbles around a single value and below zero', async () => {
    host.series.set([{ name: 'Bubbles', data: [{ x: 0, y: -4, size: 3 }] }]);
    await fixture.whenStable();
    const [from, to] = chart().yExtent();
    expect(from).toBeLessThan(-4);
    expect(to).toBeGreaterThan(-4);
    expect(to).toBeLessThanOrEqual(0);
    host.series.set([{ name: 'Bubbles', data: [{ x: 5, y: 4, size: 3 }] }]);
    await fixture.whenStable();
    expect(chart().yExtent()[0]).toBeLessThan(4);
    expect(chart().yExtent()[1]).toBeGreaterThan(4);
  });

  it('skips trend lines of series with one point', async () => {
    host.trend.set(true);
    await fixture.whenStable();
    expect(all('.tx-scatter-chart__trend').map((line) => line.getAttribute('data-series'))).toEqual(['0']);
  });

  it('draws the guides toward axes on the top and the right', async () => {
    host.xAxisPosition.set('top');
    host.yAxisPosition.set('right');
    await fixture.whenStable();
    await key('ArrowRight');
    const dot = chart().activeDot();
    const plotBox = chart().layout().plot;
    expect(chart().guides()).toEqual({
      x: { x1: dot?.cx, y1: plotBox.top, x2: dot?.cx, y2: (dot?.cy ?? 0) - (dot?.r ?? 0) },
      y: { x1: (dot?.cx ?? 0) + (dot?.r ?? 0), y1: dot?.cy, x2: plotBox.left + plotBox.width, y2: dot?.cy },
    });
  });

  it('places annotations on numbers, numeric strings and dates', async () => {
    host.annotations.set([
      { type: 'x-line', x: 2 },
      { type: 'x-line', x: '1' },
      { type: 'x-line', x: 'bad' },
      { type: 'y-line', y: 4 },
    ]);
    await fixture.whenStable();
    const shapes = chart().annotationShapes();
    expect(shapes).toHaveLength(3);
    expect(shapes[0].x1).toBe(chart().layout().categoryPosition(0, 2));
    expect(shapes[1].x1).toBe(chart().layout().categoryPosition(0, 1));
    expect(shapes[2].y1).toBe(chart().layout().value.map(4));
    host.series.set([{ name: 'Time', data: [{ x: '2026-01-01', y: 1 }, { x: '2026-02-01', y: 2 }] }]);
    host.xType.set('time');
    host.annotations.set([{ type: 'x-line', x: new Date('2026-01-15') }, { type: 'x-line', x: 'never' }]);
    await fixture.whenStable();
    expect(chart().annotationShapes()).toHaveLength(1);
  });

  it('shows counts and the active point in a stat legend', async () => {
    host.legendVariant.set('stat');
    await fixture.whenStable();
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['3', '1']);
    await key('ArrowRight');
    expect(all('.tx-chart-legend__stat').map((item) => item.textContent?.trim())).toEqual(['4', '1']);
    expect(all('.tx-chart-legend__caption')[0].textContent).toContain('First');
    await key('ArrowRight');
    expect(all('.tx-chart-legend__caption')[0].textContent).toContain('2');
    expect(chart().tooltip()).toBeNull();
  });

  it('clears the active point off the dots and on leave', async () => {
    const dot = chart().dots()[0];
    await pointer('pointermove', dot.cx, dot.cy);
    expect(chart().active()).toMatchObject({ series: 0, index: 0 });
    await pointer('pointermove', dot.cx + 200, dot.cy + 200);
    expect(chart().active()).toBeNull();
    await pointer('pointermove', dot.cx, dot.cy);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('focuses a series on legend hover unless it is hidden', async () => {
    legend(1).dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBe(1);
    expect(el('.tx-scatter-chart').classList).toContain('tx-scatter-chart--focused');
    legend(1).dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBeNull();
    legend(1).click();
    await fixture.whenStable();
    legend(1).dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(chart().focusedSeries()).toBeNull();
  });

  it('renders own legend and tooltip templates', async () => {
    host.templates.set(true);
    await fixture.whenStable();
    expect(all('.own-legend').map((item) => item.textContent)).toEqual(['A', 'B']);
    await key('ArrowRight');
    expect(document.querySelector('.own-tooltip')?.textContent).toBe('A');
  });

  it('reads the dot radius from the tokens', async () => {
    host.dt.set({ scatter: { pointRadius: '7', bubbleMinRadius: '3', bubbleMaxRadius: '30' } });
    await fixture.whenStable();
    expect(chart().radius()).toEqual({ point: 7, min: 3, max: 30 });
    expect(all('.tx-scatter-chart__point')[0].getAttribute('r')).toBe('7');
  });
});

describe('TxScatterChart recompiled by TestBed', () => {
  it('still renders its points when a test overrides the component', async () => {
    TestBed.overrideComponent(TxScatterChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-scatter-chart__point').length).toBeGreaterThan(0);
  });
});
