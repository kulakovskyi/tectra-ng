import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-line-only-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    [categories]="days"
    [area]="false"
    markers
    [height]="320"
    ariaLabel="Response time by day"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLineOnlyExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly series: TxChartSeries[] = [
    { name: 'p50, ms', data: [182, 176, 190, 201, 188, 160, 158] },
    { name: 'p95, ms', data: [412, 398, 455, 470, 430, 360, 352] },
  ];
}
