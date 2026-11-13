/** Anything the date helpers accept: a `Date`, an ISO string, a timestamp in ms, or nothing. */
export type TxDateInput = Date | string | number | null | undefined;

/** Settings of the `txDate` pipe, set with `provideTxDateFormat`. */
export interface TxDateFormatConfig {
  /** Angular date format or preset used when the pipe gets none (default `mediumDate`). */
  format: string;
  /** Text shown for an empty or invalid date (default `-`). */
  empty: string;
  /** Locale of the formatted dates (default `en-US`). */
  locale: string;
  /** Time zone of the formatted dates; the local one when not set. */
  timezone: string | undefined;
}

/** A date range as two ISO strings. */
export interface TxIsoRange {
  /** First day or moment of the range. */
  start: string;
  /** Last day or moment of the range. */
  end: string;
}
