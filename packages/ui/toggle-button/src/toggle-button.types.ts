export type TxToggleButtonSize = 'small' | 'medium' | 'large';
export type TxToggleButtonIconPosition = 'left' | 'right';
export type TxToggleButtonPart = 'root' | 'content' | 'icon' | 'label';

export interface TxToggleButtonChangeEvent {
  originalEvent: Event;
  checked: boolean;
}
