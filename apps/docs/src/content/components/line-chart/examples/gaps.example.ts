import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-gaps-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="days"
    [height]="300"
    ariaLabel="Temperature with sensor outages"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartGapsExample {
  readonly days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
  readonly series: TxChartSeries[] = [
    {
      name: 'Server room, °C',
      data: [21, 22, 21.5, null, null, 23, 24, 23.5, 22, null, 21, 21.5, 22, 22.5],
    },
  ];
}
