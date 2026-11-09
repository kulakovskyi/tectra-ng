import { TxIconName } from '@tectra-ng/icons';

export interface TxActionsMenuItem {
  id: string;
  label: string;
  icon?: TxIconName | (string & {});
  danger?: boolean;
}

export type TxActionsMenuSize = 'small' | 'medium';

export type TxActionsMenuPart = 'root' | 'trigger' | 'list' | 'item' | 'icon' | 'label';
