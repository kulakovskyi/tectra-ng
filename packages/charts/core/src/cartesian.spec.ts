import { TxCartesianOptions, alignedDomain, cartesianLayout } from './cartesian';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const options = (extra: Partial<TxCartesianOptions> = {}): TxCartesianOptions => ({
  width: 600,
  height: 300,
  intl: 'en-US',
  category: { kind: 'band', labels: DAYS },
  value: { extent: [0, 100] },
  ...extra,
});

const positions = (layout: ReturnType<typeof cartesianLayout>) =>
  layout.axes.axes.map((axis) => axis.position);

describe('cartesian layout', () => {
  it('lays out a horizontal chart with titles, both grids and a zero line', () => {
    const layout = cartesianLayout(
      options({
        horizontal: true,
        category: {
          kind: 'band',
          labels: ['A very long category label that is truncated somewhere', 'Short'],
          title: 'Team',
          maxLabelWidth: 80,
        },
        value: { extent: [-40, 60], title: 'Score' },
        grid: 'both',
      }),
    );
    expect(layout.horizontal).toBe(true);
    expect(positions(layout)).toEqual(['bottom', 'left']);
    const [valueAxis, categoryAxis] = layout.axes.axes;
    expect(valueAxis.title?.text).toBe('Score');
    expect(valueAxis.labels[0].baseline).toBe('hanging');
    expect(categoryAxis.title?.rotate).toBe(-90);
    expect(categoryAxis.labels[0].title).toBe(
      'A very long category label that is truncated somewhere',
    );
    expect(categoryAxis.labels[1].title).toBeUndefined();
    expect(layout.axes.zero).toMatchObject({ zero: true, y1: layout.plot.top });
    expect(layout.axes.grid.some((line) => line.y1 === line.y2)).toBe(true);
    expect(layout.categoryIndexAt(layout.plot.top + 1)).toBe(0);
  });

  it('moves the axes of a horizontal chart to the top and right and can hide them', () => {
    const layout = cartesianLayout(
      options({
        horizontal: true,
        xAxisPosition: 'top',
        yAxisPosition: 'right',
        category: { kind: 'point', labels: DAYS },
      }),
    );
    expect(positions(layout)).toEqual(['top', 'right']);
    expect(layout.axes.axes[0].labels[0].baseline).toBe('auto');
    expect(layout.axes.axes[1].labels[0].anchor).toBe('start');
    const bare = cartesianLayout(
      options({
        horizontal: true,
        showCategoryAxis: false,
        showValueAxis: false,
        category: { kind: 'band', labels: DAYS, title: 'Day' },
        value: { extent: [0, 10], title: 'Count' },
      }),
    );
    expect(bare.axes.axes).toEqual([]);
    expect(bare.plot.left).toBe(4);
  });

  it('puts a secondary axis on the left when the main one is on the right', () => {
    const layout = cartesianLayout(
      options({
        yAxisPosition: 'right',
        xAxisPosition: 'top',
        value: { extent: [0, 100], title: 'Visits' },
        secondaryValue: { extent: [0, 5], title: 'Rate' },
      }),
    );
    expect(positions(layout)).toEqual(['right', 'left', 'top']);
    expect(layout.axes.axes[1].title?.rotate).toBe(-90);
    expect(layout.axes.axes[1].labels[0].anchor).toBe('end');
    expect(layout.axes.axes[0].title?.rotate).toBe(90);
  });

  it('builds a log secondary axis and a log value axis', () => {
    const layout = cartesianLayout(
      options({
        value: { extent: [0, 5000], scale: 'log' },
        secondaryValue: { extent: [1, 1000], scale: 'log', min: 1 },
      }),
    );
    expect(layout.value.kind).toBe('log');
    expect(layout.value.domain[0]).toBe(1);
    expect(layout.secondaryValue?.kind).toBe('log');
    expect(layout.secondaryValueTicks).toContain(10);
    expect(layout.axes.zero).toBeNull();
  });

  it('honours fixed limits and a data range without zero', () => {
    const layout = cartesianLayout(
      options({ value: { extent: [50, 80], includeZero: false, min: 40, tickCount: 3 } }),
    );
    expect(layout.value.domain[0]).toBe(40);
    const free = cartesianLayout(options({ value: { extent: null, max: 7 } }));
    expect(free.value.domain).toEqual([0, 7]);
  });

  it('rotates crowded labels and moves them over the plot when the axis is on top', () => {
    const labels = Array.from({ length: 20 }, (_, index) => `Category number ${index + 1}`);
    const bottom = cartesianLayout(options({ category: { kind: 'band', labels, title: 'Group' } }));
    const bottomAxis = bottom.axes.axes.at(-1);
    expect(bottomAxis?.labels[0].rotate).toBe(-45);
    expect(bottomAxis?.labels[0].anchor).toBe('end');
    const top = cartesianLayout(
      options({
        xAxisPosition: 'top',
        category: { kind: 'band', labels, labelMode: 'rotate', maxLabelWidth: 40 },
      }),
    );
    const topAxis = top.axes.axes.at(-1);
    expect(topAxis?.position).toBe('top');
    expect(topAxis?.labels[0].anchor).toBe('start');
    expect(topAxis?.labels[0].title).toBe('Category number 1');
    expect(top.plot.top).toBeGreaterThan(40);
  });

  it('skips labels that do not fit when rotation is off', () => {
    const labels = Array.from({ length: 60 }, (_, index) => `Week ${index + 1}`);
    const layout = cartesianLayout(
      options({ category: { kind: 'point', labels, labelMode: 'skip' } }),
    );
    const axis = layout.axes.axes.at(-1);
    expect(axis?.labels.length).toBeLessThan(60);
    expect(axis?.labels.every((label) => label.rotate === 0)).toBe(true);
    const single = cartesianLayout(
      options({ category: { kind: 'point', labels: ['Only'], maxLabels: 4 } }),
    );
    expect(single.axes.axes.at(-1)?.labels.map((label) => label.text)).toEqual(['Only']);
  });

  it('formats linear and time category ticks and finds the nearest x', () => {
    const linear = cartesianLayout(
      options({ category: { kind: 'linear', domain: [0, 1000] }, grid: 'category' }),
    );
    expect(linear.axes.axes.at(-1)?.labels.length).toBeGreaterThan(1);
    expect(linear.axes.grid.every((line) => line.x1 === line.x2)).toBe(true);
    expect(linear.categoryPosition(0)).toBe(linear.plot.left);
    expect(linear.categoryIndexAt(linear.plot.left + linear.plot.width, [0, 400, 1000])).toBe(2);
    expect(linear.categoryIndexAt(linear.plot.left)).toBe(-1);
    const start = new Date(2026, 0, 1).getTime();
    const time = cartesianLayout(
      options({
        category: {
          kind: 'time',
          domain: [start, start + 7 * 86_400_000],
          format: (value) => `t${value}`,
        },
      }),
    );
    expect(time.axes.axes.at(-1)?.labels[0].text).toMatch(/^t\d+/);
    const plain = cartesianLayout(options({ category: { kind: 'time' }, grid: 'none' }));
    expect(plain.axes.grid).toEqual([]);
    const fallback = cartesianLayout(options({ category: { kind: 'linear' } }));
    expect(fallback.categoryPosition(1)).toBe(fallback.plot.left + fallback.plot.width);
  });

  it('counts categories from the labels or nothing', () => {
    const empty = cartesianLayout(options({ category: { kind: 'band' }, showValueAxis: false }));
    expect(empty.axes.axes).toHaveLength(1);
    expect(empty.axes.axes[0].labels).toEqual([]);
  });
});

describe('aligned secondary domain', () => {
  it('returns nothing for log scales, fixed limits or no intervals', () => {
    expect(alignedDomain({ extent: [0, 10], scale: 'log' }, 4)).toBeNull();
    expect(alignedDomain({ extent: [0, 10], min: 0 }, 4)).toBeNull();
    expect(alignedDomain({ extent: [0, 10] }, 0)).toBeNull();
  });

  it('spreads a flat or missing extent over the intervals', () => {
    expect(alignedDomain({ extent: [5, 5], includeZero: false }, 2)?.domain).toEqual([0, 10]);
    expect(alignedDomain({ extent: [-5, -5], includeZero: false }, 2)?.domain).toEqual([-10, 0]);
    expect(alignedDomain({ extent: null }, 4)?.ticks).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('puts zero on the same tick as the primary axis', () => {
    const aligned = alignedDomain({ extent: [-30, 90] }, 4, 1);
    expect(aligned?.ticks[1]).toBe(0);
    expect(aligned?.domain[0]).toBeLessThanOrEqual(-30);
    expect(alignedDomain({ extent: [-30, 90] }, 4, 0)?.ticks[0]).toBeLessThanOrEqual(-30);
  });
});
