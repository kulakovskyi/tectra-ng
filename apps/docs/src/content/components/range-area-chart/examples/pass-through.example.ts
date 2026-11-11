import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';

@Component({
  selector: 'range-area-chart-pass-through-example',
  imports: [TxRangeAreaChart],
  template: `<tx-range-area-chart
    [series]="series"
    [categories]="days"
    [pt]="{ edge: { style: { 'stroke-dasharray': '4 3' } } }"
    ariaLabel="Dashed edges"
  />`,
  styles: `
    tx-range-area-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeAreaChartPassThroughExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  readonly series: TxRangeSeries[] = [
    {
      name: 'Load',
      low: [20, 25, 22, 30, 28],
      high: [45, 52, 48, 60, 55],
      line: [32, 38, 35, 44, 41],
    },
  ];
}
