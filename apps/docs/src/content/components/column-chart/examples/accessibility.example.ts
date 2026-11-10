import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';

@Component({
  selector: 'column-chart-accessibility-example',
  imports: [TxColumnChart],
  template: `<tx-column-chart
    [series]="series"
    [categories]="teams"
    ariaLabel="Open issues by team"
  />`,
  styles: `
    tx-column-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartAccessibilityExample {
  readonly teams = ['Core', 'Docs', 'Design', 'Infra'];
  readonly series: TxChartSeries[] = [
    { name: 'Bugs', data: [12, 4, 6, 9] },
    { name: 'Features', data: [20, 8, 14, 5] },
  ];
}
