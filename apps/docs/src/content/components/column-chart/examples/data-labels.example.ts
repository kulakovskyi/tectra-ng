import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-data-labels-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="months"
    [stacked]="false"
    dataLabels
    valueFormat="compact"
    ariaLabel="Newsletter reach"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartDataLabelsExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxChartSeries[] = [
    { name: 'Sent', data: [12400, 13100, 12800, 14900, 15200, 16100] },
    { name: 'Opened', data: [5200, 5900, 5600, 6800, 7100, 7600] },
  ];
}
