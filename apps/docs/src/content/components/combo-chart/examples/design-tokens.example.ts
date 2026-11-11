import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-design-tokens-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="months"
    [dt]="{
      bar: { radius: '2px', width: '72%', groupGap: '6px' },
      line: { strokeWidth: '3' },
      series: { color1: 'var(--tx-green-500)', color2: 'var(--tx-amber-400)' },
    }"
    ariaLabel="Plan, fact and trend"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartDesignTokensExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Plan', data: [30, 32, 34, 36, 38] },
    { name: 'Fact', data: [28, 35, 31, 39, 41], type: 'line' },
  ];
}
