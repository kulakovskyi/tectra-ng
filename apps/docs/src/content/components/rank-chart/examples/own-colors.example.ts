import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRankChart, TxRankSeries, rankLineColor } from '@tectra-ng/charts/rank-line';
import { TxTag } from '@tectra-ng/ui/tag';

const DAY = 86_400_000;
const START = Date.UTC(2026, 5, 1, 9);
const SITES = ['ours.example', 'rival-one.example', 'rival-two.example'];

@Component({
  selector: 'rank-chart-own-colors-example',
  imports: [TxRankChart, TxTag],
  template: `
    <div class="wrap">
      <div class="legend">
        @for (item of series; track item.name; let index = $index) {
          <tx-tag [value]="item.name" [style.--dot]="item.color ?? color(index)" class="item" />
        }
      </div>
      <tx-rank-chart
        [series]="series"
        [maxRank]="10"
        [height]="280"
        ariaLabel="Our site against rivals"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .item {
      box-shadow: inset 3px 0 0 var(--dot);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartOwnColorsExample {
  readonly color = rankLineColor;
  readonly series: TxRankSeries[] = SITES.map((name, index) => ({
    name,
    color: index === 0 ? 'var(--tx-green-500)' : undefined,
    points: Array.from({ length: 8 }, (_, day) => ({
      time: START + day * DAY,
      rank: [2, 4, 6][index] + ((day + index) % 3) - 1,
    })),
  }));
}
