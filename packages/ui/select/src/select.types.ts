export type TxSelectSize = 'small' | 'medium' | 'large';

export interface TxSelectItem {
  id: string;
  label: string;
  value: unknown;
  option: object;
  selected: boolean;
}
