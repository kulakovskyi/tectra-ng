import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-legend-values-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="budget"
    legendValues
    legendPosition="right"
    [chartWidth]="440"
    [chartHeight]="220"
    totalLabel="Total, %"
    ariaLabel="Budget split"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartLegendValuesExample {
  readonly budget: TxPieData = {
    series: [38, 24, 16, 12, 10],
    labels: ['Salaries', 'Infrastructure', 'Marketing', 'Office', 'Other'],
  };
}
