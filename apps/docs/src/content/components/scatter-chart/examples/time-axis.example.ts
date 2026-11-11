import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-time-axis-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xType="time"
    yAxisTitle="Duration, min"
    ariaLabel="Build duration over time"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartTimeAxisExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Main',
      data: [
        { x: '2026-09-02', y: 14 },
        { x: '2026-09-09', y: 16 },
        { x: '2026-09-17', y: 15 },
        { x: '2026-09-28', y: 19 },
        { x: '2026-10-06', y: 18 },
        { x: '2026-10-15', y: 22 },
        { x: '2026-10-27', y: 12 },
        { x: '2026-11-03', y: 11 },
      ],
    },
    {
      name: 'Release',
      data: [
        { x: '2026-09-05', y: 24 },
        { x: '2026-09-21', y: 27 },
        { x: '2026-10-10', y: 31 },
        { x: '2026-10-30', y: 21 },
      ],
    },
  ];
}
