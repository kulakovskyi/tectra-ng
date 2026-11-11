import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-second-axis-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="quarters"
    valueFormat="compact"
    y2ValueFormat="percent"
    yAxisTitle="Revenue"
    y2AxisTitle="Margin"
    ariaLabel="Revenue and margin by quarter"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartSecondAxisExample {
  readonly quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Revenue', data: [1240000, 1380000, 1310000, 1620000, 1710000, 1890000] },
    { name: 'Margin', data: [18.2, 21.5, 19.8, 24.1, 25.3, 27.9], type: 'line', axis: 'secondary' },
  ];
}
