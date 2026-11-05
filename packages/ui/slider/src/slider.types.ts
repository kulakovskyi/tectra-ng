export type TxSliderValue = number | [number, number];
export type TxSliderOrientation = 'horizontal' | 'vertical';
export type TxSliderPart = 'root' | 'track' | 'range' | 'handle' | 'mark' | 'label';

export interface TxSliderMark {
  value: number;
  label?: string;
}

export interface TxSliderChangeEvent {
  value: TxSliderValue;
  originalEvent: Event;
}
