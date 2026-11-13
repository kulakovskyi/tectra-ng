/** Smallest step of a relative time: `time` (seconds, minutes, hours) or `day`. */
export type TxRelativeTimeGranularity = 'time' | 'day';

/** Options of `txRelativeTime` and `relativeTime`. */
export interface TxRelativeTimeOptions {
  /** Locale of the text (default `en-US`; the pipe uses the tectra locale). */
  locale?: string;
  /** The moment to compare with (default: now). */
  now?: Date | number;
  /** `time` (default) counts seconds, minutes and hours within a day; `day` counts whole days only. */
  granularity?: TxRelativeTimeGranularity;
  /** Largest unit used: `day`, `month` or `year` (default `year`). */
  largestUnit?: 'day' | 'month' | 'year';
  /** `auto` (default) says "yesterday", `always` says "1 day ago". */
  numeric?: 'auto' | 'always';
  /** Length of the text: `long` (default), `short` or `narrow`. */
  style?: 'long' | 'short' | 'narrow';
}
