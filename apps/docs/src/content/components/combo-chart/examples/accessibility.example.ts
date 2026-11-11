import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-accessibility-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="teams"
    y2ValueFormat="percent"
    ariaLabel="Open issues and resolution rate by team"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartAccessibilityExample {
  readonly teams = ['Core', 'Docs', 'Design', 'Infra'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Open issues', data: [32, 12, 20, 14] },
    { name: 'Resolved', data: [78, 91, 84, 88], type: 'line', axis: 'secondary' },
  ];
}
