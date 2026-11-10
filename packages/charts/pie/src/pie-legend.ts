import { Pipe, PipeTransform } from '@angular/core';
import { seriesColor } from '@tectra-ng/charts/core';
import { TxPieData, TxPieLegendItem } from './pie-chart.types';

export function pieLegend(data: TxPieData | null | undefined): TxPieLegendItem[] {
  if (!data) {
    return [];
  }
  const total = data.series.reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
  return data.series.map((value, index) => ({
    label: data.labels[index] ?? '',
    value,
    percent: total ? (Math.max(0, value) / total) * 100 : 0,
    color: seriesColor(data.colors?.[index], index),
  }));
}

@Pipe({ name: 'txPieLegend' })
export class TxPieLegendPipe implements PipeTransform {
  transform(data: TxPieData | null | undefined): TxPieLegendItem[] {
    return pieLegend(data);
  }
}
