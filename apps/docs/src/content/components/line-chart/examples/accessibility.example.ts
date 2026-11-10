import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-accessibility-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="months"
    [height]="280"
    ariaLabel="Support tickets in the first half of the year"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartAccessibilityExample {
  readonly months = ['January', 'February', 'March', 'April', 'May', 'June'];
  readonly series: TxChartSeries[] = [
    { name: 'Opened', data: [180, 164, 192, 175, 150, 142] },
    { name: 'Solved', data: [170, 168, 185, 180, 158, 147] },
  ];
}
