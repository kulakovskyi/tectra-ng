import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-pass-through-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="days"
    [pt]="{
      line: { style: { 'stroke-dasharray': '6 4' } },
    }"
    ariaLabel="Orders by day and the forecast"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartPassThroughExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Orders', data: [42, 44, 39, 46, 51, 65, 58] },
    { name: 'Forecast', data: [40, 42, 43, 45, 50, 60, 61], type: 'line' },
  ];
}
