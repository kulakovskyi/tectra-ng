/** Size of `tx-rating`: `small`, `medium` or `large`. */
export type TxRatingSize = 'small' | 'medium' | 'large';
/** Parts of `tx-rating` that `pt` can style. */
export type TxRatingPart = 'root' | 'stars' | 'star' | 'clear';

/** Payload of the rating change event: the new value and the DOM event. */
export interface TxRatingChangeEvent {
  /** The new rating, or `null` when it was cleared. */
  value: number | null;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}

/** Context of the `txRatingOnIcon` and `txRatingOffIcon` templates. */
export interface TxRatingIconContext {
  /** Index of the star being drawn. */
  $implicit: number;
}
