export type TxChartStackType = 'normal' | '100%';

export type TxStackedValue = [number, number] | null;

export function stackValues(series: readonly (readonly (number | null)[])[], type: TxChartStackType = 'normal'): TxStackedValue[][] {
  const length = Math.max(0, ...series.map((values) => values.length));
  const totals = Array.from({ length }, (_, index) => series.reduce((sum, values) => sum + Math.abs(values[index] ?? 0), 0));
  const positive = new Array<number>(length).fill(0);
  const negative = new Array<number>(length).fill(0);
  return series.map((values) =>
    Array.from({ length }, (_, index) => {
      const raw = values[index];
      if (raw === null || raw === undefined || !Number.isFinite(raw)) {
        return null;
      }
      const value = type === '100%' ? (totals[index] ? (raw / totals[index]) * 100 : 0) : raw;
      if (value >= 0) {
        const start = positive[index];
        positive[index] += value;
        return [start, positive[index]];
      }
      const start = negative[index];
      negative[index] += value;
      return [start, negative[index]];
    }),
  );
}

export function stackExtent(stacked: readonly TxStackedValue[][]): [number, number] {
  let min = 0;
  let max = 0;
  for (const values of stacked) {
    for (const value of values) {
      if (value) {
        min = Math.min(min, value[0], value[1]);
        max = Math.max(max, value[0], value[1]);
      }
    }
  }
  return [min, max];
}

export function topOfStack(stacked: readonly TxStackedValue[][], index: number, sign: 1 | -1): number {
  let found = -1;
  stacked.forEach((values, seriesIndex) => {
    const value = values[index];
    if (value && value[1] !== value[0] && Math.sign(value[1] - value[0]) === sign) {
      found = seriesIndex;
    }
  });
  return found;
}
