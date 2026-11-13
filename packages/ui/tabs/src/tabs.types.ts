import { TxIconName } from '@tectra-ng/icons';

/** Value that identifies a tab and its panel. */
export type TxTabValue = string | number;
/** Look of the tabs: equal items in a track, content-width pills or an underline. */
export type TxTabsVariant = 'segmented' | 'pills' | 'line';
/** Size of the tabs. */
export type TxTabsSize = 'small' | 'medium';
/** Direction of the tab list: in a row or in a column. */
export type TxTabsOrientation = 'horizontal' | 'vertical';
/** Parts of `tx-tabs` that `pt` can style. */
export type TxTabsPart = 'root' | 'list' | 'track' | 'content' | 'tab' | 'icon' | 'label' | 'badge' | 'activeBar' | 'previousButton' | 'nextButton' | 'description' | 'panels' | 'panel';

/** One tab of the `tabs` input of `tx-tabs`. */
export interface TxTabItem {
  /** Value that identifies the tab. */
  value: TxTabValue;
  /** Text of the tab. */
  label: string;
  /** Icon before the label. */
  icon?: TxIconName | (string & {});
  /** Tooltip text of the tab. */
  tooltip?: string;
  /** Hint under the control while the tab is active. */
  description?: string;
  /** Counter after the label; `0` is shown, `null` hides it. */
  badge?: number | string | null;
  /** The tab cannot be picked. */
  disabled?: boolean;
}

/** Context of the `txTabPanelContent` template of a panel. */
export interface TxTabPanelContentContext {
  /** Value of the panel. */
  $implicit: TxTabValue;
  /** Value of the panel. */
  value: TxTabValue;
}
