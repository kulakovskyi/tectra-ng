import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-pass-through-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="days"
    [pt]="{
      bar: { style: { stroke: 'var(--tx-surface-card)', 'stroke-width': '2' } },
    }"
    ariaLabel="Orders by day"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartPassThroughExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxChartSeries[] = [
    { name: 'Pickup', data: [12, 14, 9, 16, 21, 25, 18] },
    { name: 'Delivery', data: [30, 28, 35, 33, 41, 52, 47] },
  ];
}
