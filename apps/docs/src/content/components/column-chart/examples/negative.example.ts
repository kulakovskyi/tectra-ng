import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-negative-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="months"
    ariaLabel="Cash flow by month"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartNegativeExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  readonly series: TxChartSeries[] = [
    { name: 'Income', data: [42, 38, 51, 47, 55, 61, 58, 66] },
    { name: 'Expenses', data: [-35, -41, -38, -52, -44, -47, -60, -49] },
  ];
}
