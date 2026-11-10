import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-time-axis-example',
  imports: [TxLineChart],
  template: `<tx-line-chart
    [series]="series"
    xType="time"
    markers
    [height]="320"
    ariaLabel="Orders on sale days"
  />`,
  styles: `
    tx-line-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartTimeAxisExample {
  readonly series: TxChartSeries[] = [
    {
      name: 'Orders',
      data: [
        { x: '2026-03-02', y: 140 },
        { x: '2026-03-03', y: 152 },
        { x: '2026-03-05', y: 171 },
        { x: '2026-03-09', y: 168 },
        { x: '2026-03-10', y: 190 },
        { x: '2026-03-24', y: 260 },
        { x: '2026-03-25', y: 244 },
        { x: '2026-03-27', y: 231 },
        { x: '2026-04-06', y: 205 },
        { x: '2026-04-08', y: 222 },
      ],
    },
  ];
}
