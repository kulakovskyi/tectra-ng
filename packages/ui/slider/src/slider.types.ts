/** Value of `tx-slider`: a number, or `[start, end]` in range mode. */
export type TxSliderValue = number | [number, number];
/** Direction of the slider track: `horizontal` or `vertical`. */
export type TxSliderOrientation = 'horizontal' | 'vertical';
/** Parts of `tx-slider` that `pt` can style. */
export type TxSliderPart = 'root' | 'track' | 'range' | 'handle' | 'mark' | 'label';

/** A mark on the slider track at a value, with an optional label. */
export interface TxSliderMark {
  /** Value at which the mark sits. */
  value: number;
  /** Text shown next to the mark. */
  label?: string;
}

/** Payload of the slider change event: the new value and the DOM event. */
export interface TxSliderChangeEvent {
  /** The new value; `[start, end]` in range mode. */
  value: TxSliderValue;
  /** The DOM event that caused the change. */
  originalEvent: Event;
}
