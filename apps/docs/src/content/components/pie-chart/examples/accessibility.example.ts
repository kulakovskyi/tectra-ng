import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-accessibility-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="browsers"
    [chartWidth]="260"
    [chartHeight]="320"
    ariaLabel="Visitors by browser"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartAccessibilityExample {
  readonly browsers: TxPieData = {
    series: [64, 19, 11, 6],
    labels: ['Chrome', 'Safari', 'Firefox', 'Edge'],
  };
}
