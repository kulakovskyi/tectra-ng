import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';

const DAY = 86_400_000;
const START = Date.UTC(2026, 2, 2, 9);

function track(name: string, ranks: (number | null)[]): TxRankSeries {
  return { name, points: ranks.map((rank, day) => ({ time: START + day * DAY, rank })) };
}

@Component({
  selector: 'rank-chart-basic-example',
  imports: [TxRankChart],
  template: `<tx-rank-chart
    [series]="series"
    rankLabel="Position"
    ariaLabel="Search positions for “running shoes”"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartBasicExample {
  readonly series: TxRankSeries[] = [
    track('runfast.example', [9, 8, 8, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1, 1]),
    track('trailhub.example', [3, 3, 4, 4, 4, 6, 7, 7, 9, 8, 8, 10, 11, 12]),
    track('stridewear.example', [14, 13, null, null, 11, 9, 9, 8, 6, 6, 5, 5, 4, 3]),
  ];
}
