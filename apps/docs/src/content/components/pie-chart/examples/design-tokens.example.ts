import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPieChart, TxPieData } from '@tectra-ng/charts/pie';

@Component({
  selector: 'pie-chart-design-tokens-example',
  imports: [TxPieChart],
  template: `
    <tx-pie-chart
      [pieData]="budget"
      [chartWidth]="260"
      [chartHeight]="320"
      totalLabel="Budget"
      [dt]="{
        series: {
          color1: 'var(--tx-primary-700)',
          color2: 'var(--tx-sky-400)',
          color3: 'var(--tx-green-400)',
          color4: 'var(--tx-amber-400)',
          color5: 'var(--tx-red-400)',
        },
        pie: { valueFontWeight: '700', labelFontSize: '11px' },
      }"
      ariaLabel="Budget split"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PieChartDesignTokensExample {
  readonly budget: TxPieData = {
    series: [38, 24, 16, 12, 10],
    labels: ['Salaries', 'Infrastructure', 'Marketing', 'Office', 'Other'],
  };
}
