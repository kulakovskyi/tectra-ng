import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-percent-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="channels"
    stackType="100%"
    ariaLabel="Ticket outcome by channel"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartPercentExample {
  readonly channels = ['Email', 'Chat', 'Phone', 'Forum'];
  readonly series: TxChartSeries[] = [
    { name: 'Solved', data: [420, 610, 230, 120] },
    { name: 'Escalated', data: [80, 45, 60, 30] },
    { name: 'Open', data: [55, 30, 25, 70] },
  ];
}
