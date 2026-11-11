import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCandle, TxCandlestickChart } from '@tectra-ng/charts/candlestick';

@Component({
  selector: 'candlestick-chart-categories-example',
  imports: [TxCandlestickChart],
  template: `<tx-candlestick-chart
    [data]="data"
    labelMode="auto"
    ariaLabel="Weekly sprint estimates"
  />`,
  styles: `
    tx-candlestick-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CandlestickChartCategoriesExample {
  readonly data: TxCandle[] = [
    { x: 'Sprint 1', open: 21, high: 34, low: 18, close: 30 },
    { x: 'Sprint 2', open: 30, high: 32, low: 22, close: 24 },
    { x: 'Sprint 3', open: 24, high: 36, low: 23, close: 35 },
    { x: 'Sprint 4', open: 35, high: 41, low: 29, close: 38 },
    { x: 'Sprint 5', open: 38, high: 39, low: 26, close: 28 },
  ];
}
