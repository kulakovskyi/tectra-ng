import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';
import { TxSelect } from '@tectra-ng/ui/select';

const WEEK = 7 * 86_400_000;
const START = Date.UTC(2026, 0, 5, 9);

@Component({
  selector: 'rank-chart-depth-example',
  imports: [TxRankChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select class="control" ariaLabel="Depth" [options]="depths" [(ngModel)]="depth" />
      <tx-rank-chart
        [series]="series"
        [maxRank]="depth()"
        [height]="320"
        ariaLabel="Weekly position"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
    .control {
      width: 160px;
    }
    tx-rank-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartDepthExample {
  readonly depths = [
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
    { label: 'Top 50', value: 50 },
    { label: 'Top 100', value: 100 },
  ];
  readonly depth = signal(50);
  readonly series: TxRankSeries[] = [
    {
      name: 'blog.example/guide',
      points: [68, 54, 47, 41, 33, 28, 22, 19, 14, 11, 9, 7].map((rank, week) => ({
        time: START + week * WEEK,
        rank,
      })),
    },
  ];
}
