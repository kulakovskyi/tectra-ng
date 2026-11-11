import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-bubble-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Price, $"
    yAxisTitle="Rating"
    sizeLabel="Reviews"
    sizeFormat="compact"
    [yMin]="3"
    [yMax]="5"
    ariaLabel="Price, rating and number of reviews by product"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartBubbleExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Headphones',
      data: [
        { x: 49, y: 4.1, size: 1200, label: 'Model S' },
        { x: 89, y: 4.4, size: 5400, label: 'Model M' },
        { x: 149, y: 4.6, size: 8900, label: 'Model L' },
        { x: 299, y: 4.8, size: 2100, label: 'Model Pro' },
      ],
    },
    {
      name: 'Speakers',
      data: [
        { x: 39, y: 3.7, size: 800, label: 'Mini' },
        { x: 119, y: 4.2, size: 3600, label: 'Home' },
        { x: 199, y: 4.5, size: 6200, label: 'Room' },
        { x: 349, y: 4.3, size: 950, label: 'Studio' },
      ],
    },
  ];
}
