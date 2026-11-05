export type TxRatingSize = 'small' | 'medium' | 'large';
export type TxRatingPart = 'root' | 'stars' | 'star' | 'clear';

export interface TxRatingChangeEvent {
  value: number | null;
  originalEvent: Event;
}

export interface TxRatingIconContext {
  $implicit: number;
}
