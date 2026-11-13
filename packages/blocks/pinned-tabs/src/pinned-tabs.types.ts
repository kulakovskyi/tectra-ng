/** A value of `tx-pinned-tabs` that can be pinned. */
export interface TxPinnedTabOption {
  /** Value that is selected when its tab is picked. */
  value: string;
  /** Text of the tab and of the option in the dialog. */
  label: string;
}

/** Data of the pinned tabs settings dialog. */
export interface TxPinnedTabsDialogData {
  /** Values that can be pinned. */
  options: readonly TxPinnedTabOption[];
  /** Values pinned now. */
  pinned: readonly string[];
  /** Dialog title; the translated "Pinned tabs" by default. */
  title?: string;
  /** Explanation in the dialog; a translated hint by default. */
  text?: string;
}

/** Names of the parts of `tx-pinned-tabs` that its `pt` input can style. */
export type TxPinnedTabsPart = 'root' | 'tabs' | 'button';
