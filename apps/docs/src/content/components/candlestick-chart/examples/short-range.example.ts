import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCandle, TxCandlestickChart } from '@tectra-ng/charts/candlestick';

function candles(count: number, start: number, seed: number): TxCandle[] {
  const result: TxCandle[] = [];
  let close = start;
  const day = new Date(2026, 8, 1);
  for (let index = 0; result.length < count; index++) {
    const date = new Date(day.getFullYear(), day.getMonth(), day.getDate() + index);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const wave = Math.sin((index + seed) * 0.45) * 2.4 + Math.cos((index + seed) * 0.17) * 1.6;
    const open = close;
    close = Math.round((open + wave) * 100) / 100;
    const spread = 0.8 + Math.abs(Math.sin((index + seed) * 1.7)) * 1.6;
    result.push({
      x: date,
      open,
      close,
      high: Math.round((Math.max(open, close) + spread) * 100) / 100,
      low: Math.round((Math.min(open, close) - spread * 0.8) * 100) / 100,
      volume: Math.round(1200 + Math.abs(wave) * 900 + ((index * 37) % 500)),
    });
  }
  return result;
}

@Component({
  selector: 'candlestick-chart-short-range-example',
  imports: [TxCandlestickChart],
  template: `<tx-candlestick-chart
    [data]="data"
    [height]="300"
    valueFormat="integer"
    yAxisPosition="left"
    ariaLabel="Last two weeks"
  />`,
  styles: `
    tx-candlestick-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CandlestickChartShortRangeExample {
  readonly data = candles(10, 312, 7);
}
