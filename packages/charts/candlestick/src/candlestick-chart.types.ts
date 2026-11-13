import { TxChartPart } from '@tectra-ng/charts/core';

/** One period of `tx-candlestick-chart`: open, high, low, close and an optional volume. */
export interface TxCandle {
  /** Time of the period: a `Date`, an ISO date string, or any label. */
  x: string | number | Date;
  /** Price at the start of the period. */
  open: number;
  /** Highest price of the period. */
  high: number;
  /** Lowest price of the period. */
  low: number;
  /** Price at the end of the period. */
  close: number;
  /** Traded volume, drawn as a bar along the bottom. */
  volume?: number | null;
}

/** Look of the periods: `candle` draws a body, `ohlc` draws a bar with ticks. */
export type TxCandlestickVariant = 'candle' | 'ohlc';

/** Parts of `tx-candlestick-chart` that `pt` can style. */
export type TxCandlestickChartPart = TxChartPart | 'candle' | 'wick' | 'body' | 'volume' | 'crosshair';

/** A period of `tx-candlestick-chart` laid out in pixels, ready to draw. */
export interface TxCandleShape {
  /** Index of the candle in the data. */
  index: number;
  /** Stable key of the candle. */
  key: string;
  /** `true` when the close is at or above the open. */
  up: boolean;
  /** Horizontal center of the candle. */
  center: number;
  /** Width of the candle body. */
  width: number;
  /** Y of the highest price. */
  high: number;
  /** Y of the lowest price. */
  low: number;
  /** Y of the open price. */
  open: number;
  /** Y of the close price. */
  close: number;
  /** Top of the body. */
  bodyY: number;
  /** Height of the body. */
  bodyHeight: number;
  /** Top of the volume bar; `null` without volume. */
  volumeY: number | null;
  /** Height of the volume bar. */
  volumeHeight: number;
}

/** Payload of `candleClick`: the clicked period. */
export interface TxCandleEvent {
  /** Index of the candle in the data. */
  index: number;
  /** The formatted date or label of the period. */
  label: string;
  /** The clicked candle as given in `data`. */
  candle: TxCandle;
}
