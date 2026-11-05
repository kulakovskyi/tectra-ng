export type TxSelectSize = 'small' | 'medium' | 'large';
export type TxFieldVariant = 'outlined' | 'filled';

export interface TxSelectItem {
  id: string;
  label: string;
  value: unknown;
  option: object;
  selected: boolean;
}
