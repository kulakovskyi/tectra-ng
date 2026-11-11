import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-accessibility-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Hours studied"
    yAxisTitle="Score"
    ariaLabel="Hours studied and test score"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartAccessibilityExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Morning group',
      data: [
        [2, 58],
        [4, 66],
        [5, 71],
        [7, 80],
        [9, 88],
      ],
    },
    {
      name: 'Evening group',
      data: [
        [1, 49],
        [3, 60],
        [6, 69],
        [8, 77],
        [10, 85],
      ],
    },
  ];
}
