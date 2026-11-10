import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-basic-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="categories"
    ariaLabel="Tickets by weekday"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartBasicExample {
  readonly categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxChartSeries[] = [
    { name: 'Opened', data: [44, 55, 41, 67, 22, 13, 18] },
    { name: 'In progress', data: [13, 23, 20, 8, 13, 9, 6] },
    { name: 'Closed', data: [11, 17, 15, 15, 21, 8, 12] },
  ];
}
