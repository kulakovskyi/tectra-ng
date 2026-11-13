import { TxTranslations } from '@tectra-ng/core/config';
import { formatMessage } from '@tectra-ng/core/i18n';
import { TxChartPoint, TxChartSeries, TxChartTable, TxChartX } from './chart.types';
import { toTime } from './scale';

/** How x values are read: as `category` labels, as `time` or as `linear` numbers. */
export type TxChartXType = 'category' | 'time' | 'linear';

/** Series reduced to a common x axis: labels, x values and one row of values per series. */
export interface TxSeriesTable {
  /** Text of each x position. */
  labels: string[];
  /** Numeric x of each position: the index for categories, ms for time. */
  xs: number[];
  /** Values per series, one per position; `null` where a series has none. */
  values: (number | null)[][];
}

function isPointList(data: TxChartSeries['data']): data is readonly TxChartPoint[] {
  return data.length > 0 && typeof data[0] === 'object' && data[0] !== null;
}

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function xValue(x: TxChartX, type: TxChartXType): number | null {
  if (type === 'time') {
    return toTime(x);
  }
  const value = typeof x === 'number' ? x : Number(x);
  return Number.isFinite(value) ? value : null;
}

/**
 * Turns series of numbers or `{ x, y }` points into labels, x values and a value table on one shared x
 * axis.
 */
export function normalizeSeries(series: readonly TxChartSeries[], categories: readonly (string | number | Date)[] = [], type: TxChartXType = 'category'): TxSeriesTable {
  const pointMode = series.some((item) => isPointList(item.data));
  if (type === 'category') {
    if (!pointMode) {
      const length = Math.max(categories.length, ...series.map((item) => item.data.length), 0);
      return {
        labels: Array.from({ length }, (_, index) => (categories[index] !== undefined ? String(categories[index]) : String(index + 1))),
        xs: Array.from({ length }, (_, index) => index),
        values: series.map((item) => Array.from({ length }, (_, index) => numeric(item.data[index]))),
      };
    }
    const labels: string[] = [];
    const seen = new Map<string, number>();
    series.forEach((item) =>
      (item.data as readonly TxChartPoint[]).forEach((point) => {
        const key = String(point.x);
        if (!seen.has(key)) {
          seen.set(key, labels.length);
          labels.push(key);
        }
      }),
    );
    return {
      labels,
      xs: labels.map((_, index) => index),
      values: series.map((item) => {
        const row = new Array<number | null>(labels.length).fill(null);
        (item.data as readonly TxChartPoint[]).forEach((point) => (row[seen.get(String(point.x)) ?? 0] = numeric(point.y)));
        return row;
      }),
    };
  }
  if (!pointMode) {
    const xs = categories.map((category) => xValue(category, type));
    const order = xs.map((x, index) => ({ x, index })).filter((entry): entry is { x: number; index: number } => entry.x !== null);
    order.sort((a, b) => a.x - b.x);
    return {
      labels: order.map((entry) => String(categories[entry.index])),
      xs: order.map((entry) => entry.x),
      values: series.map((item) => order.map((entry) => numeric(item.data[entry.index]))),
    };
  }
  const all = new Set<number>();
  const parsed = series.map((item) =>
    (item.data as readonly TxChartPoint[])
      .map((point) => ({ x: xValue(point.x, type), y: numeric(point.y) }))
      .filter((point): point is { x: number; y: number | null } => point.x !== null),
  );
  parsed.forEach((points) => points.forEach((point) => all.add(point.x)));
  const xs = [...all].sort((a, b) => a - b);
  const position = new Map(xs.map((x, index) => [x, index]));
  return {
    labels: xs.map(String),
    xs,
    values: parsed.map((points) => {
      const row = new Array<number | null>(xs.length).fill(null);
      points.forEach((point) => (row[position.get(point.x) ?? 0] = point.y));
      return row;
    }),
  };
}

/** Whether any value is not `null`. */
export function hasChartData(values: readonly (readonly (number | null)[])[]): boolean {
  return values.some((row) => row.some((value) => value !== null));
}

/**
 * Text for screen readers that sums up a chart: type, number of series and points and, when given, the
 * value range.
 */
export function chartSummary(
  translations: TxTranslations,
  intl: string,
  type: string,
  seriesCount: number,
  pointCount: number,
  range: [string, string] | null,
): string {
  const head = formatMessage(translations.chartSummary, { type, series: seriesCount, points: pointCount }, intl);
  return range ? `${head}, ${formatMessage(translations.chartRange, { min: range[0], max: range[1] }, intl)}` : head;
}

/** Most rows of the hidden data table (250). */
export const TX_CHART_TABLE_ROWS = 250;

/** Indexes of the rows to put in the data table; long data is thinned evenly down to `limit`. */
export function tableRows(count: number, limit = TX_CHART_TABLE_ROWS): number[] {
  if (count <= limit) {
    return Array.from({ length: count }, (_, index) => index);
  }
  const step = (count - 1) / (limit - 1);
  return Array.from({ length: limit }, (_, index) => Math.round(index * step));
}

/** Builds the hidden data table from labels and series values; a missing value shows as a dash. */
export function chartTable(
  labels: readonly string[],
  series: readonly { name: string; values: readonly (number | null)[] }[],
  format: (value: number, seriesIndex: number) => string,
  limit = TX_CHART_TABLE_ROWS,
): TxChartTable {
  return {
    columns: series.map((item, index) => ({ key: `${index}`, label: item.name })),
    rows: tableRows(labels.length, limit).map((index) => ({
      label: labels[index],
      cells: series.map((item, seriesIndex) => {
        const value = item.values[index];
        return value === null || value === undefined ? '—' : format(value, seriesIndex);
      }),
    })),
  };
}
