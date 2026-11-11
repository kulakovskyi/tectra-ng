import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxBoxplotChart, TxBoxplotSeries } from '@tectra-ng/charts/boxplot';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'boxplot-chart-loading-and-empty-example',
  imports: [TxBoxplotChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="live.set([])"></button>
      </div>
      <tx-boxplot-chart
        [series]="live()"
        [categories]="['A', 'B', 'C']"
        [loading]="loading()"
        [height]="260"
        ariaLabel="Loaded data"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BoxplotChartLoadingAndEmptyExample {
  readonly live = signal<TxBoxplotSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.live.set([
        {
          name: 'Sample',
          data: [
            [3, 5, 6, 8, 9],
            [4, 6, 7, 7, 11],
            [2, 3, 5, 6, 8],
          ],
        },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
