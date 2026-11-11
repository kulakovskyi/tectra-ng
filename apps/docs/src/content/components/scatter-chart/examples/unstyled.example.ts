import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-unstyled-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    unstyled
    [height]="260"
    ariaLabel="Unstyled chart"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartUnstyledExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Points',
      data: [
        [1, 3],
        [2, 5],
        [3, 4],
        [4, 7],
      ],
    },
  ];
}
