/** Anything the date helpers accept: a `Date`, an ISO string, a timestamp in ms, or nothing. */
export type TxDateInput = Date | string | number | null | undefined;

/** A format of `txDate`: an Angular date pattern or preset (`'dd.MM.yyyy'`, `'mediumDate'`), or `Intl.DateTimeFormat` options such as `TX_DATE_STYLES.dateTime`. */
export type TxDateFormat = string | Intl.DateTimeFormatOptions;

/** Settings of the `txDate` pipe, set with `provideTxDateFormat`. */
export interface TxDateFormatConfig {
  /** Format used when the pipe gets none (default `TX_DATE_STYLES.date`, a medium date in the locale). */
  format: TxDateFormat;
  /** Text shown for an empty or invalid date (default `-`). */
  empty: string;
  /** Locale of the formatted dates; the tectra locale, followed as it changes, when not set. */
  locale: string | undefined;
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
