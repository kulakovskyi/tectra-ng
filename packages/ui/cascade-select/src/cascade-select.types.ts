export type TxCascadeSelectPart = 'root' | 'box' | 'trigger' | 'value' | 'clear' | 'dropdown' | 'panel' | 'column' | 'option' | 'empty';

export interface TxCascadeItem {
  id: string;
  label: string;
  value: unknown;
  option: unknown;
  level: number;
  index: number;
  group: boolean;
  disabled: boolean;
  selected: boolean;
  onPath: boolean;
}

export interface TxCascadeSelectChangeEvent {
  value: unknown;
  option: unknown;
  path: unknown[];
}
