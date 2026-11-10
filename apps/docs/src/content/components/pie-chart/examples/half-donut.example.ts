import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-half-donut-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="votes"
    [startAngle]="-90"
    [endAngle]="90"
    [chartWidth]="320"
    [chartHeight]="240"
    totalLabel="Votes"
    ariaLabel="Votes by answer"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartHalfDonutExample {
  readonly votes: TxPieData = {
    series: [412, 268, 120],
    labels: ['Yes', 'No', 'Not sure'],
  };
}
