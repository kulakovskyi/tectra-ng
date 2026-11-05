export type TxRadioButtonSize = 'small' | 'medium' | 'large';
export type TxRadioButtonVariant = 'outlined' | 'filled';
export type TxRadioButtonPart = 'root' | 'box' | 'input' | 'dot' | 'label' | 'description';
export type TxRadioGroupPart = 'root';
export type TxRadioGroupOrientation = 'vertical' | 'horizontal';

export interface TxRadioButtonChangeEvent {
  value: unknown;
  originalEvent: Event;
}
