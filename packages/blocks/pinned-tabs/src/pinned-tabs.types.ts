export interface TxPinnedTabOption {
  value: string;
  label: string;
}

export interface TxPinnedTabsDialogData {
  options: readonly TxPinnedTabOption[];
  pinned: readonly string[];
  title?: string;
  text?: string;
}

export type TxPinnedTabsPart = 'root' | 'tabs' | 'button';
