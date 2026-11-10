import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-pass-through-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="budget"
    [chartWidth]="260"
    [chartHeight]="320"
    [pt]="pt"
    ariaLabel="Budget split"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartPassThroughExample {
  readonly budget: TxPieData = {
    series: [38, 24, 16, 12, 10],
    labels: ['Salaries', 'Infrastructure', 'Marketing', 'Office', 'Other'],
  };
  readonly pt = {
    dataLabel: { style: { 'font-size': '10px' } },
    legendItem: { style: { 'font-weight': '400' } },
  };
}
