import { TxIconName } from '@tectra-ng/icons';

/** One action of `tx-actions-menu`. */
export interface TxActionsMenuItem {
  /** Value reported when the action is picked. */
  id: string;
  /** Text of the action. */
  label: string;
  /** Name of the icon before the label. */
  icon?: TxIconName | (string & {});
  /** Shows the action in the danger colour, for deleting and the like. */
  danger?: boolean;
}

/** Size of the trigger of `tx-actions-menu`: `small` or `medium`. */
export type TxActionsMenuSize = 'small' | 'medium';

/** Names of the parts of `tx-actions-menu` that its `pt` input can style. */
export type TxActionsMenuPart = 'root' | 'trigger' | 'list' | 'item' | 'icon' | 'label';
