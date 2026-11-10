import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-basic-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="traffic"
    [chartWidth]="260"
    [chartHeight]="320"
    totalLabel="Visits"
    ariaLabel="Visits by source"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartBasicExample {
  readonly traffic: TxPieData = {
    series: [4200, 2600, 1800, 950, 450],
    labels: ['Search', 'Direct', 'Social', 'Email', 'Referral'],
  };
}
