/** Unit of the `value` a countdown starts from: `days`, `hours`, `minutes` or `seconds`. */
export type TxCountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds';
/** How the time left is shown: `number` of whole units, or `clock` as `mm:ss` or `h:mm:ss`. */
export type TxCountdownFormat = 'number' | 'clock';
/** A point in time to count down to: a `Date`, an ISO string or milliseconds; empty means none. */
export type TxCountdownTarget = Date | string | number | null | undefined;
/** Names of the parts of `tx-countdown` that `pt` can style. */
export type TxCountdownPart = 'root';

/** Context of the custom countdown template. */
export interface TxCountdownContext {
  /** Time left in milliseconds. */
  $implicit: number;
  /** Whole days left. */
  days: number;
  /** Hours left after the whole days, 0 to 23. */
  hours: number;
  /** Minutes left after the whole hours, 0 to 59. */
  minutes: number;
  /** Seconds left after the whole minutes, 0 to 59. */
  seconds: number;
  /** Whether zero was reached. */
  expired: boolean;
}
