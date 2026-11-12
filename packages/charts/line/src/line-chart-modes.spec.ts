import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartLegendTemplate, TxChartPointerEvent, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from './line-chart.component';

type Inputs = Partial<Record<keyof TxLineChart, unknown>>;

const create = async (inputs: Inputs): Promise<ComponentFixture<TxLineChart>> => {
  const fixture = TestBed.createComponent(TxLineChart);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return fixture;
};

const event = (
  type: TxChartPointerEvent['type'],
  x: number,
  y: number,
  buttons?: number,
): TxChartPointerEvent => ({ type, x, y, target: null, buttons });

const keydown = (chart: TxLineChart, key: string, shiftKey = false) =>
  chart.onNavigate(new KeyboardEvent('keydown', { key, shiftKey }));

describe('TxLineChart data shapes', () => {
  afterEach(() =>
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = '')),
  );

  it('treats missing series and categories as empty', async () => {
    const fixture = await create({ xType: 'linear', series: null, categories: null });
    const chart = fixture.componentInstance;
    expect(chart.isEmpty()).toBe(true);
    expect(chart.fullDomain()).toEqual([0, 1]);
    expect(fixture.nativeElement.querySelector('.tx-chart-frame__empty')?.textContent).toContain(
      'No data',
    );
    keydown(chart, 'ArrowRight');
    expect(chart.active()).toBeNull();
    chart.onPointer(event('move', chart.layout().plot.left + 10, chart.layout().plot.top + 10));
    expect(chart.active()).toBeNull();
  });

  it('keeps the last points of a linear series and widens a single x', async () => {
    const fixture = await create({
      xType: 'linear',
      maxPoints: 3,
      series: [{ name: 'Load', data: [5, 6, 7, 8, 9] }],
      categories: [10, 20, 30, 40, 50],
    });
    const chart = fixture.componentInstance;
    expect(chart.fullTable().xs).toEqual([30, 40, 50]);
    expect(chart.minSpan()).toBeCloseTo(0.4);
    fixture.componentRef.setInput('maxPoints', 1);
    fixture.componentRef.setInput('categories', [7]);
    fixture.componentRef.setInput('series', [{ name: 'Load', data: [3] }]);
    await fixture.whenStable();
    expect(chart.fullDomain()).toEqual([7, 8]);
    expect(chart.layout().category.kind).toBe('linear');
  });

  it('labels a time axis with dates and places time annotations', async () => {
    const fixture = await create({
      xType: 'time',
      series: [{ name: 'Orders', data: [1, 2, 3] }],
      categories: ['2026-01-01', '2026-01-02', '2026-01-03'],
      annotations: [
        { type: 'x-line', x: '2026-01-02', label: 'Mid' },
        { type: 'x-line', x: 'not a date', label: 'Lost' },
      ],
    });
    const chart = fixture.componentInstance;
    expect(chart.labels()).toHaveLength(3);
    expect(chart.labels()[0]).not.toBe('2026-01-01');
    const labels = [...fixture.nativeElement.querySelectorAll('.tx-chart-annotation__label')].map(
      (label: Element) => label.textContent?.trim(),
    );
    expect(labels).toEqual(['Mid']);
  });

  it('places linear annotations from numbers and numeric strings only', async () => {
    const fixture = await create({
      xType: 'linear',
      series: [{ name: 'Load', data: [1, 4, 2] }],
      categories: [0, 5, 10],
      annotations: [
        { type: 'x-line', x: 5, label: 'Number' },
        { type: 'x-line', x: '7', label: 'Text' },
        { type: 'x-line', x: 'seven', label: 'Word' },
        { type: 'x-line', x: 'Nope', label: 'Missing' },
      ],
    });
    const labels = [...fixture.nativeElement.querySelectorAll('.tx-chart-annotation__label')].map(
      (label: Element) => label.textContent?.trim(),
    );
    expect(labels).toEqual(['Number', 'Text']);
  });

  it('skips category annotations outside the zoomed window', async () => {
    const months = Array.from({ length: 12 }, (_, index) => `M${index + 1}`);
    const fixture = await create({
      zoom: true,
      xRange: [6, 9],
      series: [{ name: 'Visits', data: months.map((_, index) => index) }],
      categories: months,
      annotations: [
        { type: 'x-line', x: 'M2', label: 'Before' },
        { type: 'x-line', x: 'M8', label: 'Inside' },
        { type: 'x-line', x: 'M12', label: 'After' },
      ],
    });
    const labels = [...fixture.nativeElement.querySelectorAll('.tx-chart-annotation__label')].map(
      (label: Element) => label.textContent?.trim(),
    );
    expect(labels).toEqual(['Inside']);
  });

  it('starts the value axis at the data without an area', async () => {
    const fixture = await create({
      area: false,
      series: [{ name: 'Price', data: [100, 120, 110] }],
      categories: ['a', 'b', 'c'],
    });
    const chart = fixture.componentInstance;
    expect(chart.layout().value.domain[0]).toBeGreaterThan(0);
    expect(chart.paths()[0].area).toBe('');
  });

  it('thins a long series with gaps and keeps the area under the sampled points', async () => {
    const data = Array.from({ length: 3000 }, (_, index) =>
      index % 100 === 0 ? null : Math.sin(index / 40),
    );
    const fixture = await create({ series: [{ name: 'Wave', data }] });
    const path = fixture.componentInstance.paths()[0];
    expect(path.line.split('M').length - 1).toBeGreaterThan(1);
    expect(path.area).not.toBe('');
  });

  it('formats values with the chosen format and a custom formatter', async () => {
    const fixture = await create({
      valueFormat: 'percent',
      series: [{ name: 'Share', data: [10, 20] }],
      categories: ['a', 'b'],
    });
    const chart = fixture.componentInstance;
    expect(chart.valueFormatter()(10)).toContain('%');
    fixture.componentRef.setInput(
      'tooltipFormatter',
      (value: number, context: { seriesIndex: number; dataPointIndex: number }) =>
        `${value}@${context.dataPointIndex}`,
    );
    await fixture.whenStable();
    keydown(chart, 'End');
    await fixture.whenStable();
    expect(chart.tooltip()?.rows[0].value).toBe('20@1');
  });
});

describe('TxLineChart stacks and legend', () => {
  it('stacks visible series, totals the tooltip and skips hidden ones', async () => {
    const fixture = await create({
      stacked: true,
      series: [
        { name: 'A', data: [1, 2, 3] },
        { name: 'B', data: [4, null, 6] },
        { name: 'C', data: [null, null, null] },
      ],
      categories: ['x', 'y', 'z'],
    });
    const chart = fixture.componentInstance;
    keydown(chart, 'Home');
    await fixture.whenStable();
    expect(chart.tooltip()?.total).toBe('5');
    expect(chart.pointValue(1, 0)).toBe(5);
    expect(chart.pointValue(1, 1)).toBeNull();
    expect(chart.pointValue(5, 0)).toBeNull();
    chart.onLegendToggle('0:A');
    await fixture.whenStable();
    expect(chart.valueExtent()).toEqual([0, 6]);
    chart.onLegendToggle('1:B');
    await fixture.whenStable();
    expect(chart.valueExtent()).toEqual([0, 1]);
  });

  it('reports toggles of unknown keys and focuses only visible series on hover', async () => {
    const fixture = await create({
      series: [
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [2, 3] },
      ],
    });
    const chart = fixture.componentInstance;
    const toggles: unknown[] = [];
    chart.seriesToggle.subscribe((value) => toggles.push(value));
    chart.onLegendToggle('9:Z');
    expect(toggles).toEqual([{ seriesIndex: -1, name: '', hidden: true }]);
    chart.onLegendHover('0:A');
    expect(chart.focusedSeries()).toBe(0);
    chart.onLegendToggle('1:B');
    chart.onLegendHover('1:B');
    expect(chart.focusedSeries()).toBeNull();
    chart.onLegendHover(null);
    expect(chart.focusedSeries()).toBeNull();
  });

  it('shows the last value and its category in a stat legend', async () => {
    const fixture = await create({
      legendVariant: 'stat',
      series: [
        { name: 'A', data: [1, 2, null] },
        { name: 'B', data: [null, null, null] },
        { name: 'C', data: [3, 4, 5] },
      ],
      categories: ['x', 'y', 'z'],
    });
    const chart = fixture.componentInstance;
    expect(chart.legendItems().map((item) => [item.value, item.caption])).toEqual([
      ['2', 'y'],
      ['—', undefined],
      ['5', 'z'],
    ]);
    keydown(chart, 'Home');
    await fixture.whenStable();
    expect(chart.legendItems()[0].caption).toBe('x');
    expect(chart.tooltip()).toBeNull();
  });

  it('draws a legend template', async () => {
    @Component({
      imports: [TxLineChart, TxChartLegendTemplate],
      template: `
        <tx-line-chart [series]="series()">
          <ng-template txChartLegend let-item>
            <span class="own-legend">{{ item.label }}</span>
          </ng-template>
        </tx-line-chart>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class LegendHost {
      readonly series = signal<TxChartSeries[]>([
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [2, 3] },
      ]);
    }
    const fixture = TestBed.createComponent(LegendHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(
      [...fixture.nativeElement.querySelectorAll('.own-legend')].map(
        (item: Element) => item.textContent,
      ),
    ).toEqual(['A', 'B']);
  });
});

describe('TxLineChart pointer and keyboard', () => {
  const SERIES: TxChartSeries[] = [
    { name: 'A', data: [10, null, 30, 40] },
    { name: 'B', data: [5, null, 6, 50] },
  ];

  it('picks a single series in single tooltip mode', async () => {
    const fixture = await create({
      tooltipMode: 'single',
      series: SERIES,
      categories: ['a', 'b', 'c', 'd'],
    });
    const chart = fixture.componentInstance;
    keydown(chart, 'End');
    keydown(chart, 'ArrowDown');
    await fixture.whenStable();
    expect(chart.tooltip()?.rows.map((row) => row.label)).toEqual(['B']);
    expect(chart.activePoints().map((point) => point.series)).toEqual([1]);
    expect(chart.tooltip()?.y).toBe(chart.activePoints()[0].y);
    keydown(chart, 'ArrowUp');
    expect(chart.active()?.series).toBe(0);
    chart.active.set({ index: 1, series: 0, pointerY: null, keyboard: true });
    expect(chart.tooltip()).toBeNull();
    expect(chart.activePoints()).toEqual([]);
    chart.active.set({ index: 9, series: 0, pointerY: null, keyboard: true });
    expect(chart.crosshair()).toBeNull();
    expect(chart.tooltip()).toBeNull();
  });

  it('announces a gap and leaves the tooltip title empty past the labels', async () => {
    const fixture = await create({
      series: SERIES,
      categories: ['a', 'b', 'c', 'd'],
      showTooltip: false,
    });
    const chart = fixture.componentInstance;
    keydown(chart, 'Home');
    keydown(chart, 'ArrowRight');
    expect(chart.active()?.index).toBe(1);
    expect(chart.tooltip()).toBeNull();
    chart.onLegendToggle('0:A');
    chart.onLegendToggle('1:B');
    chart.active.set(null);
    keydown(chart, 'ArrowRight');
    expect(chart.active()).toBeNull();
  });

  it('ignores pointers outside the plot and picks the nearest visible series', async () => {
    const fixture = await create({ series: SERIES, categories: ['a', 'b', 'c', 'd'] });
    const chart = fixture.componentInstance;
    const plot = chart.layout().plot;
    const clicks: unknown[] = [];
    chart.pointClick.subscribe((value) => clicks.push(value));
    chart.onPointer(event('move', plot.left - 50, plot.top + 10));
    expect(chart.active()).toBeNull();
    chart.onPointer(event('move', plot.left + 2, plot.top + plot.height - 2));
    expect(chart.active()?.series).toBe(1);
    chart.onPointer(event('move', plot.left + plot.width / 3, plot.top + 2));
    expect(chart.active()?.series).toBe(0);
    chart.onPointer(event('move', plot.left + plot.width, plot.top + plot.height));
    expect(chart.active()).toMatchObject({ index: 3, series: 0 });
    chart.onLegendToggle('0:A');
    chart.onLegendToggle('1:B');
    chart.onPointer(event('click', plot.left + 2, plot.top + 2));
    expect(chart.active()?.series).toBe(-1);
    expect(clicks).toEqual([]);
  });

  it('reports a click past the labels with an empty category', async () => {
    const fixture = await create({ series: [{ name: 'A', data: [1, 2, 3] }], categories: ['a'] });
    const chart = fixture.componentInstance;
    const labels = chart.labels();
    expect(labels).toHaveLength(3);
    const clicks: { category: string }[] = [];
    chart.pointClick.subscribe((value) => clicks.push(value));
    const plot = chart.layout().plot;
    chart.onPointer(event('click', plot.left + plot.width, plot.top + 2));
    expect(clicks[0].category).toBe('3');
  });
});

describe('TxLineChart zoom and overview', () => {
  const months = Array.from({ length: 20 }, (_, index) => `M${index + 1}`);
  const series: TxChartSeries[] = [{ name: 'Visits', data: months.map((_, index) => 10 + index) }];

  it('drops a range that covers everything and ignores panning without zoom', async () => {
    const fixture = await create({ zoom: true, series, categories: months, xRange: [-5, 100] });
    const chart = fixture.componentInstance;
    expect(chart.view()).toBeNull();
    chart.panBy(50);
    expect(chart.xRange()).toEqual([-5, 100]);
    chart.zoomAt(chart.layout().plot.left, 4);
    expect(chart.xRange()).toBeNull();
    keydown(chart, 'ArrowLeft', true);
    expect(chart.active()?.index).toBe(19);
  });

  it('zooms out with − and _ and pans left with Shift around the active point', async () => {
    const fixture = await create({ zoom: true, series, categories: months, xRange: [4, 8] });
    const chart = fixture.componentInstance;
    keydown(chart, 'ArrowLeft', true);
    expect(chart.xRange()?.[0]).toBeLessThan(4);
    keydown(chart, 'Home');
    keydown(chart, '-');
    const wider = chart.xRange();
    expect((wider?.[1] ?? 0) - (wider?.[0] ?? 0)).toBeGreaterThan(4);
    chart.active.set({ index: 99, series: 0, pointerY: null, keyboard: true });
    keydown(chart, '_');
    expect(chart.active()).toBeNull();
    chart.active.set({ index: 1, series: 0, pointerY: null, keyboard: true });
    keydown(chart, '=');
    expect(chart.active()).toBeNull();
  });

  it('windows a linear series around the zoomed range', async () => {
    const fixture = await create({
      xType: 'linear',
      zoom: true,
      series: [{ name: 'Load', data: [1, 2, 3, 4, 5, 6] }],
      categories: [0, 10, 20, 30, 40, 50],
      xRange: [18, 32],
    });
    const chart = fixture.componentInstance;
    expect(chart.table().xs).toEqual([10, 20, 30, 40]);
    expect(chart.offset()).toBe(1);
    expect(chart.layout().categoryPosition(0, 18)).toBeCloseTo(chart.layout().plot.left);
  });

  it('drags the overview window, its edges and jumps to a click beside it', async () => {
    const fixture = await create({ brush: true, series, categories: months, xRange: [5, 10] });
    const chart = fixture.componentInstance;
    const strip = () => chart.overview() ?? { x0: 0, x1: 0, top: 0, left: 0, width: 0 };
    const y = strip().top + 10;
    expect(chart.onPointer(event('down', strip().x0, y))).toBeUndefined();
    chart.onPointer(event('move', strip().x0 + 1, y, 1));
    expect(chart.xRange()).toEqual([5, 10]);
    chart.onPointer(event('move', strip().x0 + 60, y, 1));
    expect(chart.xRange()?.[0]).toBeGreaterThan(5);
    expect(chart.xRange()?.[1]).toBe(10);
    chart.onPointer(event('up', strip().x0, y));
    const end = strip().x1;
    chart.onPointer(event('down', end, y));
    chart.onPointer(event('move', end - 200, y, 1));
    const [from, to] = chart.xRange() ?? [0, 0];
    expect(to - from).toBeCloseTo(chart.minSpan());
    chart.onPointer(event('up', end - 200, y));
    chart.onPointer(event('click', end - 200, y));
    chart.xRange.set([2, 4]);
    await fixture.whenStable();
    chart.onPointer(event('down', strip().left + strip().width - 2, y));
    expect(chart.xRange()?.[1]).toBe(19);
    chart.onPointer(event('move', strip().left + strip().width - 2, y));
    chart.onPointer(event('move', strip().left + strip().width - 30, y, 1));
    expect(chart.xRange()?.[1]).toBe(19);
    chart.onPointer(event('up', 0, y));
  });

  it('ignores a pointer down on the plot without zoom and a click right after a drag', async () => {
    const fixture = await create({ brush: true, series, categories: months });
    const chart = fixture.componentInstance;
    const plot = chart.layout().plot;
    chart.onPointer(event('down', plot.left + 20, plot.top + 20));
    chart.onPointer(event('up', plot.left + 20, plot.top + 20));
    chart.onPointer(event('click', plot.left + 20, plot.top + 20));
    expect(chart.active()?.index).toBe(1);
    chart.xRange.set([0, 5]);
    await fixture.whenStable();
    chart.onPointer(event('down', plot.left + 200, plot.top + 20));
    chart.onPointer(event('move', plot.left + 100, plot.top + 20, 1));
    chart.onPointer(event('up', plot.left + 100, plot.top + 20));
    const clicks: unknown[] = [];
    chart.pointClick.subscribe((value) => clicks.push(value));
    chart.onPointer(event('click', plot.left + 100, plot.top + 20));
    expect(clicks).toEqual([]);
    chart.onPointer(event('leave', 0, 0));
    expect(chart.active()).toBeNull();
  });

  it('draws the overview from the first visible series and handles flat or empty data', async () => {
    const fixture = await create({
      brush: true,
      series: [
        { name: 'Flat', data: [0, 0, null, 0] },
        { name: 'Empty', data: [null, null, null, null] },
      ],
      categories: ['a', 'b', 'c', 'd'],
    });
    const chart = fixture.componentInstance;
    expect(chart.overview()?.line).toMatch(/^M/);
    chart.onLegendToggle('0:Flat');
    expect(chart.overview()?.line).toBe('');
    chart.onLegendToggle('1:Empty');
    expect(chart.overview()?.line).toMatch(/^M/);
    expect(chart.overview()?.color).toBe('var(--tx-chart-series-color1)');
  });
});

describe('TxLineChart live slide', () => {
  const animate = vi.fn();

  beforeEach(() => {
    animate.mockReset();
    Object.defineProperty(SVGElement.prototype, 'animate', { configurable: true, value: animate });
  });

  afterEach(() => {
    delete (SVGElement.prototype as Partial<Record<'animate', unknown>>).animate;
  });

  it('slides the series left when new points push in', async () => {
    const fixture = await create({
      live: true,
      maxPoints: 4,
      series: [{ name: 'Load', data: [1, 2, 3, 4] }],
      categories: ['a', 'b', 'c', 'd'],
    });
    fixture.componentRef.setInput('series', [{ name: 'Load', data: [1, 2, 3, 4, 5] }]);
    fixture.componentRef.setInput('categories', ['a', 'b', 'c', 'd', 'e']);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0][1]).toMatchObject({ duration: 320 });
    fixture.componentRef.setInput('series', [{ name: 'Load', data: [7, 8, 9, 10, 11] }]);
    await fixture.whenStable();
    fixture.componentRef.setInput('categories', ['v', 'w', 'x', 'y', 'z']);
    await fixture.whenStable();
    fixture.componentRef.setInput('series', [{ name: 'Load', data: [] }]);
    fixture.componentRef.setInput('categories', []);
    await fixture.whenStable();
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('keeps a time series in place when the last point only moves a little', async () => {
    const fixture = await create({
      live: true,
      xType: 'linear',
      series: [{ name: 'Load', data: [1, 2] }],
      categories: [0, 100],
    });
    fixture.componentRef.setInput('series', [{ name: 'Load', data: [1, 2, 3] }]);
    fixture.componentRef.setInput('categories', [0, 100, 100.001]);
    await fixture.whenStable();
    expect(fixture.componentInstance.table().xs).toEqual([0, 100, 100.001]);
    expect(animate).not.toHaveBeenCalled();
  });
});
