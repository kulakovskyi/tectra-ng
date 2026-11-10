import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';
import { TxChartTooltipFormatter } from '@tectra-ng/charts/core';

@Component({
  selector: 'pie-chart-total-formatter-example',
  imports: [TxPieChart],
  template: `<tx-pie-chart
    [pieData]="spend"
    [chartWidth]="260"
    [chartHeight]="320"
    totalLabel="This month"
    [totalFormatter]="money"
    [tooltipFormatter]="tooltip"
    ariaLabel="Spending by category"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartTotalFormatterExample {
  readonly spend: TxPieData = {
    series: [1240.5, 860.25, 420, 310.75],
    labels: ['Rent', 'Food', 'Transport', 'Fun'],
  };
  readonly money = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
  readonly tooltip: TxChartTooltipFormatter = (value) => `$${value.toFixed(2)}`;
}
