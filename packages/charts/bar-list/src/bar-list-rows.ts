import { TxChartValueFormatter } from '@tectra-ng/charts/core';
import { TxBarListItem, TxBarListRow } from './bar-list.types';

/**
 * Sorts items from the biggest value, drops zero and negative ones, keeps the first `limit` rows and formats their values and percents.
 */
export function barListRows(
  items: readonly TxBarListItem[] | null | undefined,
  limit: number,
  format: TxChartValueFormatter,
  percentFormat: TxChartValueFormatter = format,
): TxBarListRow[] {
  const sorted = (items ?? []).filter((item) => Number.isFinite(item.value) && item.value > 0).sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  const max = sorted[0]?.value ?? 0;
  return sorted.slice(0, Math.max(0, limit)).map((item) => ({
    label: item.label,
    raw: item.value,
    value: format(item.value),
    share: (item.value / max) * 100,
    percent: `${percentFormat(Math.round((item.value / total) * 1000) / 10)}%`,
    link: item.link,
    queryParams: item.queryParams,
  }));
}
