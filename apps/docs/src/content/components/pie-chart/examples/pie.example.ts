import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-pie-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="budget"
    donutSize="0%"
    [chartWidth]="260"
    [chartHeight]="320"
    ariaLabel="Budget split"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartPieExample {
  readonly budget: TxPieData = {
    series: [38, 24, 16, 12, 10],
    labels: ['Salaries', 'Infrastructure', 'Marketing', 'Office', 'Other'],
  };
}
