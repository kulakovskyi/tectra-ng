import { TxChartPart } from '@tectra-ng/charts/core';

export interface TxCandle {
  x: string | number | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number | null;
}

export type TxCandlestickVariant = 'candle' | 'ohlc';

export type TxCandlestickChartPart = TxChartPart | 'candle' | 'wick' | 'body' | 'volume' | 'crosshair';

export interface TxCandleShape {
  index: number;
  key: string;
  up: boolean;
  center: number;
  width: number;
  high: number;
  low: number;
  open: number;
  close: number;
  bodyY: number;
  bodyHeight: number;
  volumeY: number | null;
  volumeHeight: number;
}

export interface TxCandleEvent {
  index: number;
  label: string;
  candle: TxCandle;
}
