import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';

const DAY = 86_400_000;
const START = Date.UTC(2026, 8, 7, 9);

@Component({
  selector: 'rank-chart-pass-through-example',
  imports: [TxRankChart],
  template: `
    <tx-rank-chart
      [series]="series"
      [maxRank]="10"
      [height]="260"
      [pt]="{ line: { style: { strokeDasharray: '6 4' } } }"
      ariaLabel="Forecast position"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartPassThroughExample {
  readonly series: TxRankSeries[] = [
    {
      name: 'forecast',
      points: [8, 7, 6, 6, 5, 4, 4].map((rank, day) => ({ time: START + day * DAY, rank })),
    },
  ];
}
