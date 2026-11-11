import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-unstyled-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="days"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartUnstyledExample {
  readonly days = ['Mon', 'Tue', 'Wed'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Tasks', data: [5, 8, 3] },
    { name: 'Done', data: [3, 6, 3], type: 'line' },
  ];
}
