import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-basic-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="months"
    ariaLabel="Orders and average order value"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartBasicExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Orders', data: [320, 410, 380, 470, 520, 610] },
    { name: 'Returns', data: [24, 31, 22, 35, 28, 30] },
    { name: 'Visitors, hundreds', data: [210, 260, 250, 300, 330, 390], type: 'line' },
  ];
}
