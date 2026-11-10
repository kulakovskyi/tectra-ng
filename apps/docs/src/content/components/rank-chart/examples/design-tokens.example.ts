import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';

const DAY = 86_400_000;
const START = Date.UTC(2026, 7, 3, 9);

@Component({
  selector: 'rank-chart-design-tokens-example',
  imports: [TxRankChart],
  template: `
    <tx-rank-chart
      [series]="series"
      [maxRank]="10"
      [height]="280"
      [dt]="{
        rankLine: {
          strokeWidth: '4',
          markerRadius: '5',
          markerHoverRadius: '8',
          color1: 'var(--tx-purple-500)',
          color2: 'var(--tx-amber-500)',
        },
      }"
      ariaLabel="Positions"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartDesignTokensExample {
  readonly series: TxRankSeries[] = [
    {
      name: 'alpha.example',
      points: [5, 4, 4, 3, 2, 2].map((rank, day) => ({ time: START + day * DAY, rank })),
    },
    {
      name: 'beta.example',
      points: [2, 3, 3, 4, 6, 7].map((rank, day) => ({ time: START + day * DAY, rank })),
    },
  ];
}
