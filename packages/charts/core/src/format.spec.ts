import { TX_LOCALE_US } from '@tectra-ng/core/i18n';
import { alignedDomain, cartesianLayout } from './cartesian';
import { chartMonthNames, chartNumberFormatter, compactNumber, textWidth, tickFormatter, timeTickOptions, truncateText } from './format';
import { chartSummary, chartTable, hasChartData, normalizeSeries, tableRows } from './series-data';

describe('chart formats', () => {
  it('formats numbers through the locale', () => {
    expect(chartNumberFormatter('en-US')(1234.567)).toBe('1,234.57');
    expect(chartNumberFormatter('en-US', 'integer')(1234.567)).toBe('1,235');
    expect(chartNumberFormatter('en-US', 'compact')(1234567)).toBe('1.2M');
    expect(chartNumberFormatter('en-US', 'percent')(42)).toBe('42%');
    expect(chartNumberFormatter('uk-UA')(1234.5)).toMatch(/^1\s234,5$/);
    expect(chartNumberFormatter('en-US', (value) => `#${value}`)(3)).toBe('#3');
    expect(chartNumberFormatter('en-US')(Number.NaN)).toBe('');
    expect(compactNumber(1500)).toBe('1.5K');
  });

  it('gives ticks as many decimals as the step needs', () => {
    expect(tickFormatter('en-US', [0, 0.5, 1])(0.5)).toBe('0.5');
    expect(tickFormatter('en-US', [0, 2000, 4000])(4000)).toBe('4,000');
    expect(tickFormatter('en-US', [0, 0.25], 'compact')(1200)).toBe('1.2K');
  });

  it('names months and time ticks in the locale', () => {
    expect(chartMonthNames('en-US', 'short')[0]).toBe('Jan');
    expect(chartMonthNames('uk-UA', 'long')[2]).toMatch(/^Б/);
    expect(timeTickOptions({ unit: 'month', step: 1, duration: 1 }, 1000)).toEqual({ month: 'short' });
    expect(timeTickOptions({ unit: 'year', step: 1, duration: 1 }, 1000)).toEqual({ year: 'numeric' });
  });

  it('estimates and cuts text', () => {
    expect(textWidth('100', 12)).toBeGreaterThan(textWidth('11', 12));
    expect(truncateText('A very long category name', 60, 12)).toMatch(/…$/);
    expect(truncateText('Short', 200, 12)).toBe('Short');
  });

  it('normalizes series from numbers, points and dates', () => {
    const table = normalizeSeries([{ name: 'A', data: [1, null, 3] }], ['x', 'y']);
    expect(table.labels).toEqual(['x', 'y', '3']);
    expect(table.values).toEqual([[1, null, 3]]);
    const points = normalizeSeries([
      { name: 'A', data: [{ x: 'b', y: 2 }] },
      { name: 'B', data: [{ x: 'a', y: 1 }, { x: 'b', y: 5 }] },
    ]);
    expect(points.labels).toEqual(['b', 'a']);
    expect(points.values).toEqual([
      [2, null],
      [5, 1],
    ]);
    const time = normalizeSeries([{ name: 'A', data: [{ x: '2026-01-05', y: 2 }, { x: '2026-01-01', y: 1 }] }], [], 'time');
    expect(time.xs).toEqual([new Date(2026, 0, 1).getTime(), new Date(2026, 0, 5).getTime()]);
    expect(time.values).toEqual([[1, 2]]);
    const byCategory = normalizeSeries([{ name: 'A', data: [5, 7] }], ['2026-02-01', '2026-01-01'], 'time');
    expect(byCategory.values).toEqual([[7, 5]]);
    expect(hasChartData([[null]])).toBe(false);
  });

  it('writes summaries and tables', () => {
    const summary = chartSummary(TX_LOCALE_US.translations, 'en-US', 'Line chart', 2, 1, ['1', '9']);
    expect(summary).toBe('Line chart, 2 series, 1 value, from 1 to 9');
    const table = chartTable(['Mon'], [{ name: 'A', values: [null] }], String);
    expect(table.rows[0].cells).toEqual(['—']);
    expect(tableRows(5)).toEqual([0, 1, 2, 3, 4]);
    expect(tableRows(1000, 4)).toEqual([0, 333, 666, 999]);
  });

  it('lays out a cartesian plot', () => {
    const layout = cartesianLayout({
      width: 600,
      height: 300,
      intl: 'en-US',
      category: { kind: 'band', labels: ['A', 'B', 'C'] },
      value: { extent: [-10, 90] },
    });
    expect(layout.plot.left).toBeGreaterThan(20);
    expect(layout.plot.left + layout.plot.width).toBeLessThanOrEqual(600);
    expect(layout.value.domain).toEqual([-20, 100]);
    expect(layout.axes.zero).not.toBeNull();
    expect(layout.axes.axes.find((axis) => axis.position === 'bottom')?.labels.map((label) => label.text)).toEqual(['A', 'B', 'C']);
    expect(layout.categoryIndexAt(layout.categoryPosition(2))).toBe(2);
  });

  it('moves the axes to the top and the right', () => {
    const layout = cartesianLayout({
      width: 600,
      height: 300,
      intl: 'en-US',
      category: { kind: 'band', labels: ['A', 'B'] },
      value: { extent: [0, 100] },
      xAxisPosition: 'top',
      yAxisPosition: 'right',
    });
    const right = layout.axes.axes.find((axis) => axis.position === 'right');
    const top = layout.axes.axes.find((axis) => axis.position === 'top');
    expect(right?.labels[0]).toMatchObject({ anchor: 'start' });
    expect(right?.labels[0].x).toBeGreaterThan(layout.plot.left + layout.plot.width);
    expect(top?.labels[0].y).toBeLessThan(layout.plot.top);
    expect(layout.plot.left).toBeLessThan(10);
  });

  it('rotates or skips crowded labels', () => {
    const labels = Array.from({ length: 12 }, (_, index) => `Category number ${index}`);
    const rotated = cartesianLayout({ width: 500, height: 300, intl: 'en-US', category: { kind: 'band', labels }, value: { extent: [0, 10] } });
    const bottom = rotated.axes.axes.find((axis) => axis.position === 'bottom');
    expect(bottom?.labels[0].rotate).toBe(-45);
    const skipped = cartesianLayout({ width: 500, height: 300, intl: 'en-US', category: { kind: 'point', labels, labelMode: 'skip' }, value: { extent: [0, 10] } });
    expect(skipped.axes.axes.find((axis) => axis.position === 'bottom')?.labels.length).toBeLessThan(12);
    const capped = cartesianLayout({ width: 900, height: 300, intl: 'en-US', category: { kind: 'point', labels: labels.map((_, i) => `${i}`), maxLabels: 4 }, value: { extent: [0, 10] } });
    expect(capped.axes.axes.find((axis) => axis.position === 'bottom')?.labels.length).toBeLessThanOrEqual(4);
  });

  it('puts categories on the left for horizontal bars and handles time axes', () => {
    const horizontal = cartesianLayout({ width: 500, height: 300, intl: 'en-US', horizontal: true, category: { kind: 'band', labels: ['A long label', 'B'] }, value: { extent: [0, 10] } });
    expect(horizontal.axes.axes.find((axis) => axis.position === 'left')?.labels[0].text).toBe('A long label');
    expect(horizontal.value.range[0]).toBe(horizontal.plot.left);
    const time = cartesianLayout({
      width: 800,
      height: 300,
      intl: 'en-US',
      category: { kind: 'time', domain: [new Date(2026, 0, 1).getTime(), new Date(2026, 11, 1).getTime()] },
      value: { extent: [0, 10], scale: 'log' },
    });
    expect(time.category.kind).toBe('time');
    expect(time.axes.axes.find((axis) => axis.position === 'bottom')?.labels[0].text).toBe('Jan');
    expect(time.categoryIndexAt(time.plot.left + 1, [new Date(2026, 0, 1).getTime(), new Date(2026, 6, 1).getTime()])).toBe(0);
  });

  it('adds a second value axis whose ticks sit on the grid of the first', () => {
    const layout = cartesianLayout({
      width: 600,
      height: 300,
      intl: 'en-US',
      category: { kind: 'band', labels: ['A', 'B', 'C'] },
      value: { extent: [0, 480] },
      secondaryValue: { extent: [0, 0.37], format: 'percent', title: 'Share' },
    });
    const right = layout.axes.axes.find((axis) => axis.position === 'right');
    expect(layout.secondaryValue).not.toBeNull();
    expect(layout.secondaryValueTicks.length).toBe(layout.valueTicks.length);
    expect(layout.secondaryValue?.domain[1]).toBeGreaterThanOrEqual(0.37);
    expect(right?.labels.map((label) => label.y)).toEqual(layout.valueTicks.map((tick) => layout.value.map(tick)));
    expect(right?.labels[0].x).toBeGreaterThan(layout.plot.left + layout.plot.width);
    expect(right?.title?.rotate).toBe(90);
    expect(layout.plot.left + layout.plot.width).toBeLessThan(600 - 30);
  });

  it('keeps zero on one line for both value axes', () => {
    const domain = alignedDomain({ extent: [-3, 12] }, 4, 1);
    expect(domain?.ticks).toEqual([-5, 0, 5, 10, 15]);
    expect(alignedDomain({ extent: [0, 37] }, 5)?.ticks).toEqual([0, 10, 20, 30, 40, 50]);
    expect(alignedDomain({ extent: [0, 10], min: 0 }, 5)).toBeNull();
    const left = cartesianLayout({
      width: 600,
      height: 300,
      intl: 'en-US',
      yAxisPosition: 'right',
      category: { kind: 'band', labels: ['A'] },
      value: { extent: [-40, 80] },
      secondaryValue: { extent: [0, 7] },
    });
    expect(left.axes.axes.find((axis) => axis.position === 'left')?.labels[0].anchor).toBe('end');
    expect(left.secondaryValue?.map(0)).toBeCloseTo(left.value.map(0));
  });
});
