export type TxToggleSwitchSize = 'small' | 'medium' | 'large';
export type TxToggleSwitchLabelPosition = 'start' | 'end';
export type TxToggleSwitchPart = 'root' | 'track' | 'input' | 'handle' | 'label' | 'description';

export interface TxToggleSwitchChangeEvent {
  checked: boolean;
  value: unknown;
  originalEvent: Event;
}

export interface TxToggleSwitchHandleContext {
  $implicit: boolean;
}
