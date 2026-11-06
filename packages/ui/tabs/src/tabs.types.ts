import { TxIconName } from '@tectra-ng/icons';

export type TxTabValue = string | number;
export type TxTabsVariant = 'segmented' | 'pills' | 'line';
export type TxTabsSize = 'small' | 'medium';
export type TxTabsOrientation = 'horizontal' | 'vertical';
export type TxTabsPart = 'root' | 'list' | 'track' | 'content' | 'tab' | 'icon' | 'label' | 'badge' | 'activeBar' | 'previousButton' | 'nextButton' | 'description' | 'panels' | 'panel';

export interface TxTabItem {
  value: TxTabValue;
  label: string;
  icon?: TxIconName | (string & {});
  tooltip?: string;
  description?: string;
  badge?: number | string | null;
  disabled?: boolean;
}

export interface TxTabPanelContentContext {
  $implicit: TxTabValue;
  value: TxTabValue;
}
