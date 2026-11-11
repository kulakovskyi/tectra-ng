import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-area-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="days"
    curve="straight"
    [markers]="false"
    ariaLabel="Sessions and sign-ups by day"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartAreaExample {
  readonly days = Array.from({ length: 14 }, (_, index) => `Nov ${index + 1}`);
  readonly series: TxComboChartSeries[] = [
    {
      name: 'Sessions',
      data: [820, 940, 910, 1020, 1180, 760, 690, 870, 990, 1050, 1110, 1240, 820, 740],
      type: 'area',
    },
    {
      name: 'Sign-ups',
      data: [42, 51, 47, 58, 66, 31, 28, 44, 53, 57, 61, 72, 39, 33],
      axis: 'secondary',
    },
  ];
}
