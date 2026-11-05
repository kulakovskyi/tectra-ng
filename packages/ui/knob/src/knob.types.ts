export type TxKnobArc = 'dial' | 'ring';
export type TxKnobPart = 'root' | 'svg' | 'range' | 'value' | 'handle' | 'text';

export interface TxKnobChangeEvent {
  value: number;
  originalEvent: Event;
}

export interface TxKnobValueContext {
  $implicit: number;
}
