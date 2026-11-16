import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';

function monthly(name: string, ranks: number[]): TxRankSeries {
  return { name, points: ranks.map((rank, month) => ({ time: new Date(2026, month, 1), rank })) };
}

@Component({
  selector: 'rank-chart-date-format-example',
  imports: [TxRankChart],
  template: `<tx-rank-chart
    [series]="series"
    [maxRank]="4"
    [dateFormat]="monthFormat"
    rankLabel="Place"
    showLegend
    ariaLabel="Monthly sales leaderboard"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartDateFormatExample {
  readonly monthFormat: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
  readonly series: TxRankSeries[] = [
    monthly('Alex', [2, 1, 1, 2, 3, 1]),
    monthly('Sam', [1, 2, 3, 3, 2, 2]),
    monthly('Jordan', [4, 3, 2, 1, 1, 3]),
    monthly('Riley', [3, 4, 4, 4, 4, 4]),
  ];
}
