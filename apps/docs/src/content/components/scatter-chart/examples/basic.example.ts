import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-basic-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Session length, min"
    yAxisTitle="Pages viewed"
    ariaLabel="Session length and pages viewed"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartBasicExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Desktop',
      data: [
        [4.2, 6],
        [6.8, 9],
        [9.1, 11],
        [12.4, 15],
        [3.1, 4],
        [7.7, 12],
        [10.6, 13],
        [14.8, 19],
        [5.5, 8],
        [8.9, 10],
        [11.7, 17],
        [16.2, 21],
      ],
    },
    {
      name: 'Mobile',
      data: [
        [1.8, 3],
        [2.9, 4],
        [3.7, 4],
        [5.2, 6],
        [6.1, 7],
        [2.4, 2],
        [4.6, 5],
        [7.3, 9],
        [8.4, 8],
        [3.3, 5],
        [5.9, 5],
        [9.6, 10],
      ],
    },
  ];
}
