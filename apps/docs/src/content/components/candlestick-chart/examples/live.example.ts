import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCandle, TxCandlestickChart } from '@tectra-ng/charts/candlestick';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'candlestick-chart-live-example',
  imports: [TxCandlestickChart, TxButton],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
      </div>
      <tx-candlestick-chart [data]="live()" [height]="300" ariaLabel="Shuffled data" />
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
export default class CandlestickChartLiveExample {
  private step = 0;
  readonly live = signal<TxCandle[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.live.set(this.build(this.step));
  }

  private build(step: number): TxCandle[] {
    return Array.from({ length: 20 }, (_, index) => {
      const base = 50 + Math.sin((index + step * 3) * 0.6) * 6 + index * 0.3;
      const move = Math.cos((index + step) * 1.3) * 2;
      return {
        x: new Date(2026, 9, 1 + index),
        open: Math.round(base * 10) / 10,
        close: Math.round((base + move) * 10) / 10,
        high: Math.round((Math.max(base, base + move) + 1.2) * 10) / 10,
        low: Math.round((Math.min(base, base + move) - 1.1) * 10) / 10,
        volume: 800 + ((index * 53 + step * 97) % 900),
      };
    });
  }
}
