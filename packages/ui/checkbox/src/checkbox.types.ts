export type TxCheckboxSize = 'small' | 'medium' | 'large';
export type TxCheckboxVariant = 'outlined' | 'filled';
export type TxCheckboxPart = 'root' | 'box' | 'input' | 'icon' | 'label' | 'description';
export type TxCheckboxGroupPart = 'root' | 'selectAll' | 'items';
export type TxCheckboxGroupOrientation = 'vertical' | 'horizontal';

export interface TxCheckboxChangeEvent {
  checked: boolean;
  value: unknown;
  originalEvent: Event;
}

export interface TxCheckboxIconContext {
  $implicit: boolean;
  indeterminate: boolean;
}
