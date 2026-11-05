export interface TxCountryOption {
  code: string;
  value?: string;
  label?: string;
  count?: number;
  hint?: string;
  disabled?: boolean;
}

export interface TxCountryItem {
  code: string;
  value: string;
  label: string;
  count: number | null;
  hint: string;
  disabled: boolean;
}

export type TxCountrySort = 'name' | 'none';
