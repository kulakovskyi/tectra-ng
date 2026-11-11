import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-trend-line-example',
  imports: [TxScatterChart],
  template: `<tx-scatter-chart
    [series]="series"
    trendLine
    xAxisTitle="Ad spend, $K"
    yAxisTitle="Sign-ups"
    ariaLabel="Ad spend and sign-ups by week"
  />`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartTrendLineExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Search',
      data: [
        [2, 120],
        [3, 160],
        [4, 170],
        [5, 230],
        [6, 240],
        [7, 300],
        [8, 310],
        [9, 360],
        [10, 390],
      ],
    },
    {
      name: 'Social',
      data: [
        [2, 90],
        [3, 95],
        [4, 130],
        [5, 120],
        [6, 150],
        [7, 140],
        [8, 175],
        [9, 170],
        [10, 190],
      ],
    },
  ];
}
