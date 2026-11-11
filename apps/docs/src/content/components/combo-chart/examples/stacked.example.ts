import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-stacked-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="months"
    stacked
    ariaLabel="Tickets by channel and the target"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartStackedExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Email', data: [120, 132, 101, 134, 90, 110] },
    { name: 'Chat', data: [220, 182, 191, 234, 290, 330] },
    { name: 'Phone', data: [150, 232, 201, 154, 190, 210] },
    { name: 'Target', data: [480, 500, 520, 540, 560, 580], type: 'line' },
  ];
}
