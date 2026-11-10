import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRankChart, TxRankLineEvent, TxRankSeries } from '@tectra-ng/charts/rank-line';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'rank-chart-notes-example',
  imports: [TxRankChart, TxMessage],
  template: `
    <div class="wrap">
      <tx-rank-chart
        [series]="series"
        [maxRank]="10"
        [height]="300"
        rankLabel="Position"
        ariaLabel="Position of the pricing page"
        (pointClick)="clicked.set($event)"
      />
      <tx-message severity="secondary" size="small">
        @if (clicked(); as point) {
          {{ point.name }}: position {{ point.rank }}{{ point.note ? ' — ' + point.note : '' }}
        } @else {
          Click a point.
        }
      </tx-message>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartNotesExample {
  readonly clicked = signal<TxRankLineEvent | null>(null);
  readonly series: TxRankSeries[] = [
    {
      name: '/pricing',
      points: [
        { time: '2026-04-01T08:00:00Z', rank: 7 },
        { time: '2026-04-01T20:00:00Z', rank: 6 },
        { time: '2026-04-03T08:00:00Z', rank: 6, note: 'Title rewritten' },
        { time: '2026-04-04T08:00:00Z', rank: 4 },
        { time: '2026-04-04T14:00:00Z', rank: 3 },
        { time: '2026-04-07T08:00:00Z', rank: null },
        { time: '2026-04-08T08:00:00Z', rank: 5, note: 'Page was down for an hour' },
        { time: '2026-04-09T08:00:00Z', rank: 2 },
        { time: '2026-04-10T08:00:00Z', rank: 1, note: 'Featured snippet' },
      ],
    },
  ];
}
