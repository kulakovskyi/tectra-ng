import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-pass-through-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    [pt]="{
      point: {
        style: {
          'fill-opacity': '0.25',
          'stroke-width': '2',
          stroke: 'var(--tx-scatter-chart-color)',
        },
      },
    }"
    ariaLabel="Width and height of parts"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartPassThroughExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Batch 1',
      data: [
        [10.2, 4.1],
        [10.6, 4.4],
        [9.8, 3.9],
        [10.9, 4.6],
        [10.1, 4.2],
      ],
    },
    {
      name: 'Batch 2',
      data: [
        [11.4, 5.1],
        [11.9, 5.4],
        [11.1, 4.8],
        [12.3, 5.7],
        [11.7, 5.2],
      ],
    },
  ];
}
