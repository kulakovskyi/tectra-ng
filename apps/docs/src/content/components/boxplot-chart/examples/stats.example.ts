import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBoxplotSeries, TxBoxplotChart } from '@tectra-ng/charts/boxplot';

@Component({
  selector: 'boxplot-chart-stats-example',
  imports: [TxBoxplotChart],
  template: `<tx-boxplot-chart
    [series]="series"
    [categories]="grades"
    [showOutliers]="false"
    ariaLabel="Test scores by grade"
  />`,
  styles: `
    tx-boxplot-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartStatsExample {
  readonly grades = ['Grade 5', 'Grade 6', 'Grade 7'];
  readonly series: TxBoxplotSeries[] = [
    {
      name: 'Score',
      data: [
        { min: 41, q1: 58, median: 67, q3: 76, max: 94, outliers: [22] },
        { min: 45, q1: 61, median: 70, q3: 79, max: 97 },
        { min: 38, q1: 55, median: 66, q3: 81, max: 99, outliers: [18, 24] },
      ],
    },
  ];
}
