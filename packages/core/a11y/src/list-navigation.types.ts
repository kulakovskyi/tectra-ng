/** State of a keyboard-navigated list passed to `nextListIndex`. */
export interface TxListNavigationOptions {
  /** Number of items in the list. */
  count: number;
  /** Index of the active item; `-1` when none is active. */
  current: number;
  /** Whether arrows wrap around at the ends (default `true`). */
  loop?: boolean;
  /** How many items `PageUp` / `PageDown` jump (default 10). */
  pageSize?: number;
  /** Tells whether the item at an index is disabled and must be skipped. */
  isDisabled?: (index: number) => boolean;
}
