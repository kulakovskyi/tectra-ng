/** Shape of the knob track: `dial` is a 270° arc with a gap at the bottom, `ring` a full circle. */
export type TxKnobArc = 'dial' | 'ring';
/** Parts of `tx-knob` that `pt` can style. */
export type TxKnobPart = 'root' | 'svg' | 'range' | 'value' | 'handle' | 'text';

/** Event of `changed`: the user moved the knob. */
export interface TxKnobChangeEvent {
  /** New value. */
  value: number;
  /** Pointer or keyboard event that moved the knob. */
  originalEvent: Event;
}

/** Context of a `txKnobValue` template: the text in the middle. */
export interface TxKnobValueContext {
  /** Current value. */
  $implicit: number;
}
