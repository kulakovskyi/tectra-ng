import { TxChartValueFormatter } from '@tectra-ng/charts/core';
import { TxSegmentedBarItem, TxSegmentedBarSegment } from './segmented-bar.types';

export function segmentedBarSegments(
  items: readonly TxSegmentedBarItem[] | null | undefined,
  format: TxChartValueFormatter,
  percentFormat: TxChartValueFormatter = format,
): TxSegmentedBarSegment[] {
  const list = items ?? [];
  const positive = (value: number) => (Number.isFinite(value) ? Math.max(value, 0) : 0);
  const total = list.reduce((sum, item) => sum + positive(item.value), 0);
  return list.map((item) => {
    const value = positive(item.value);
    const share = total ? (value / total) * 100 : 0;
    return {
      key: item.key,
      label: item.label,
      raw: value,
      value: format(value),
      share,
      percent: `${percentFormat(Math.round(share * 10) / 10)}%`,
      tone: item.tone ?? 'primary',
      isEmpty: value === 0,
    };
  });
}
