export type TxRelativeTimeGranularity = 'time' | 'day';

export interface TxRelativeTimeOptions {
  locale?: string;
  now?: Date | number;
  granularity?: TxRelativeTimeGranularity;
  largestUnit?: 'day' | 'month' | 'year';
  numeric?: 'auto' | 'always';
  style?: 'long' | 'short' | 'narrow';
}
