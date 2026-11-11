import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxCandle, TxCandleEvent, TxCandlestickChart } from '@tectra-ng/charts/candlestick';

@Component({
  selector: 'candlestick-chart-events-example',
  imports: [TxCandlestickChart],
  template: `
    <div class="wrap">
      <tx-candlestick-chart
        [data]="data"
        [height]="280"
        ariaLabel="Click a part"
        (candleClick)="onClick($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
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
export default class CandlestickChartEventsExample {
  readonly data: TxCandle[] = [
    { x: '2026-10-05', open: 41, high: 44, low: 40, close: 43, volume: 900 },
    { x: '2026-10-06', open: 43, high: 46, low: 42, close: 42.5, volume: 1400 },
    { x: '2026-10-07', open: 42.5, high: 43, low: 39, close: 39.5, volume: 1800 },
    { x: '2026-10-08', open: 39.5, high: 42, low: 39, close: 41.8, volume: 1100 },
  ];
  readonly message = signal('Click the chart.');

  onClick(event: TxCandleEvent): void {
    this.message.set(`${event.label}: close ${event.candle.close}`);
  }
}
