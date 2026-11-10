import { areaPath, linePath, monotoneTangents, splitGaps } from './curve';
import { decimateSeries, largestTriangleThreeBuckets } from './decimate';
import { chartColor, chartPalette, seriesColor } from './palette';
import { stackExtent, stackValues, topOfStack } from './stack';
import { cycleIndex, stepIndex, toggleKey } from './chart-interaction';
import { parseRatio } from './chart-token';
import { chartBoxHeight, chartHeightValue, initialChartSize } from './chart-size';

describe('chart shapes', () => {
  const points = [
    { x: 0, y: 10 },
    { x: 10, y: 20 },
    { x: 20, y: 5 },
  ];

  it('draws straight, step and smooth lines', () => {
    expect(linePath(points, 'straight')).toBe('M0,10L10,20L20,5');
    expect(linePath(points, 'step')).toBe('M0,10H5V20H10H15V5H20');
    expect(linePath(points, 'smooth')).toMatch(/^M0,10C/);
    expect(linePath([], 'smooth')).toBe('');
  });

  it('keeps monotone curves inside the data', () => {
    const tangents = monotoneTangents(points);
    expect(tangents[1]).toBe(0);
    expect(monotoneTangents([{ x: 0, y: 0 }])).toEqual([0]);
  });

  it('breaks lines and areas at gaps', () => {
    expect(splitGaps([points[0], null, points[1], points[2]])).toHaveLength(2);
    expect(linePath([points[0], null, points[1], points[2]], 'straight')).toBe('M0,10M10,20L20,5');
    const base = points.map((point) => ({ x: point.x, y: 30 }));
    expect(areaPath(points, base, 'straight')).toBe('M0,10L10,20L20,5L20,30L10,30L0,30Z');
    expect(areaPath([points[0], null, points[2]], [base[0], null, base[2]], 'straight')).toBe('');
  });

  it('stacks positive and negative values apart', () => {
    const stacked = stackValues([
      [10, -5, null],
      [20, -10, 4],
    ]);
    expect(stacked[0]).toEqual([[0, 10], [0, -5], null]);
    expect(stacked[1]).toEqual([
      [10, 30],
      [-5, -15],
      [0, 4],
    ]);
    expect(stackExtent(stacked)).toEqual([-15, 30]);
    expect(topOfStack(stacked, 0, 1)).toBe(1);
  });

  it('stacks to 100%', () => {
    const stacked = stackValues(
      [
        [1, 0],
        [3, 0],
      ],
      '100%',
    );
    expect(stacked[0][0]).toEqual([0, 25]);
    expect(stacked[1][0]).toEqual([25, 100]);
    expect(stacked[1][1]).toEqual([0, 0]);
  });

  it('thins long series and keeps the peaks', () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({ x: index, y: index === 500 ? 999 : Math.sin(index / 10), index }));
    const thin = largestTriangleThreeBuckets(many, 100);
    expect(thin).toHaveLength(100);
    expect(thin[0].index).toBe(0);
    expect(thin[99].index).toBe(999);
    expect(thin.some((point) => point.index === 500)).toBe(true);
    expect(largestTriangleThreeBuckets(many.slice(0, 10), 50)).toHaveLength(10);
    const gappy = decimateSeries([...many.slice(0, 400), null, ...many.slice(401)], 100);
    expect(gappy.includes(null)).toBe(true);
    expect(gappy.length).toBeLessThan(120);
  });

  it('gives palette colours that follow the theme', () => {
    expect(chartColor(0)).toBe('var(--tx-chart-series-color1)');
    expect(chartColor(7)).toBe('var(--tx-chart-series-color1)');
    expect(chartPalette(3)).toHaveLength(3);
    expect(seriesColor('red', 2)).toBe('red');
    expect(seriesColor(undefined, 2)).toBe('var(--tx-chart-series-color3)');
  });

  it('moves through values and series', () => {
    expect(stepIndex('ArrowRight', -1, 5)).toBe(0);
    expect(stepIndex('ArrowLeft', -1, 5)).toBe(4);
    expect(stepIndex('ArrowRight', 4, 5)).toBe(4);
    expect(stepIndex('End', 1, 5)).toBe(4);
    expect(stepIndex('Home', 3, 5)).toBe(0);
    expect(stepIndex('ArrowDown', 1, 5, 'ArrowDown', 'ArrowUp')).toBe(2);
    expect(cycleIndex(2, 1, [0, 2])).toBe(0);
    expect(cycleIndex(5, 1, [1, 3])).toBe(1);
    expect([...toggleKey(new Set(['a']), 'a')]).toEqual([]);
    expect([...toggleKey(new Set(), 'b')]).toEqual(['b']);
  });

  it('reads ratios and sizes', () => {
    expect(parseRatio('48%', 1)).toBe(0.48);
    expect(parseRatio('2px', 0)).toBe(2);
    expect(parseRatio('', 3)).toBe(3);
    expect(parseRatio(0.5, 1)).toBe(0.5);
    expect(chartHeightValue(320)).toBe(320);
    expect(chartHeightValue('280px')).toBe(280);
    expect(chartHeightValue('100%')).toBe(350);
    expect(chartBoxHeight(400, 'top')).toBe(369);
    expect(initialChartSize(400, 'right')).toEqual({ width: 465, height: 400 });
  });
});
