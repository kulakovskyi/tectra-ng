import { TxPlacement } from '@tectra-ng/core/overlay';
import { TectraConfirmTokens, TectraDeepPartial } from '@tectra-ng/themes';

export type TxConfirmSeverity = 'primary' | 'info' | 'success' | 'warn' | 'danger';
export type TxConfirmFocus = 'accept' | 'reject';

export interface TxConfirmOptions {
  title?: string;
  message?: string;
  icon?: string | false;
  severity?: TxConfirmSeverity;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptIcon?: string;
  defaultFocus?: TxConfirmFocus;
  accept?: () => unknown;
  placement?: TxPlacement;
  dt?: TectraDeepPartial<TectraConfirmTokens>;
}

export interface TxConfirmState {
  options: TxConfirmOptions;
  messageId: string;
  busy: boolean;
}
