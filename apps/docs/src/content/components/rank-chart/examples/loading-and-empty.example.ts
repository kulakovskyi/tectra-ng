import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRankChart, TxRankSeries } from '@tectra-ng/charts/rank-line';
import { TxButton } from '@tectra-ng/ui/button';

const DAY = 86_400_000;
const START = Date.UTC(2026, 6, 1, 9);

@Component({
  selector: 'rank-chart-loading-and-empty-example',
  imports: [TxRankChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="series.set([])"></button>
      </div>
      <tx-rank-chart
        [series]="series()"
        [loading]="loading()"
        [maxRank]="10"
        [height]="260"
        ariaLabel="Position"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RankChartLoadingAndEmptyExample {
  readonly series = signal<TxRankSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.series.set([
        {
          name: 'docs.example',
          points: [6, 5, 5, 3, 2].map((rank, day) => ({ time: START + day * DAY, rank })),
        },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
