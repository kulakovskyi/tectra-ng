import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxRangeAreaChart, TxRangeSeries } from '@tectra-ng/charts/range-area';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'range-area-chart-loading-and-empty-example',
  imports: [TxRangeAreaChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="live.set([])"></button>
      </div>
      <tx-range-area-chart
        [series]="live()"
        [categories]="['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
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
export default class RangeAreaChartLoadingAndEmptyExample {
  readonly live = signal<TxRangeSeries[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.live.set([
        {
          name: 'Load',
          low: [10, 12, 9, 14, 13],
          high: [22, 25, 21, 28, 26],
          line: [16, 18, 15, 21, 19],
        },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
