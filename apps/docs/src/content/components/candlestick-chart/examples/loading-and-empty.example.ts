import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCandle, TxCandlestickChart } from '@tectra-ng/charts/candlestick';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'candlestick-chart-loading-and-empty-example',
  imports: [TxCandlestickChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Load data" variant="outlined" (click)="load()"></button>
        <button txButton label="Clear" variant="text" (click)="live.set([])"></button>
      </div>
      <tx-candlestick-chart
        [data]="live()"
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
export default class CandlestickChartLoadingAndEmptyExample {
  readonly live = signal<TxCandle[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.live.set([
        { x: '2026-10-12', open: 10, high: 12, low: 9, close: 11.5, volume: 500 },
        { x: '2026-10-13', open: 11.5, high: 12.4, low: 10.2, close: 10.6, volume: 650 },
      ]);
      this.loading.set(false);
    }, 900);
  }
}
