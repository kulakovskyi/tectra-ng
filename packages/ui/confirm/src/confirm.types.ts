import { TxPlacement } from '@tectra-ng/core/overlay';
import { TectraConfirmTokens, TectraDeepPartial } from '@tectra-ng/themes';

/** Meaning of the question, which sets the icon and the accept button colour. */
export type TxConfirmSeverity = 'primary' | 'info' | 'success' | 'warn' | 'danger';
/** Which button gets focus when the question opens: `accept` or `reject`. */
export type TxConfirmFocus = 'accept' | 'reject';

/** Text, look and behaviour of one confirmation question. */
export interface TxConfirmOptions {
  /** Question in bold; "Are you sure?" by default (translated). */
  title?: string;
  /** Details under the title; also describes the dialog for screen readers. */
  message?: string;
  /** Icon name before the title; `false` hides the icon, the default follows `severity`. */
  icon?: string | false;
  /** Colour of the icon and the accept button (default `primary`). */
  severity?: TxConfirmSeverity;
  /** Text of the accept button; "Confirm", or "Delete" for `danger` (translated). */
  acceptLabel?: string;
  /** Text of the reject button (translated "Cancel" by default). */
  rejectLabel?: string;
  /** Icon on the accept button; a trash can for `danger`. */
  acceptIcon?: string;
  /** Button that gets focus first (default `reject`, the safe choice). */
  defaultFocus?: TxConfirmFocus;
  /** Runs on accept and may return a promise: the button waits, and a rejection keeps the question open. */
  accept?: () => unknown;
  /** Popup only: where the popup opens relative to its origin (default `bottom`). */
  placement?: TxPlacement;
  /** Design tokens of this one question. */
  dt?: TectraDeepPartial<TectraConfirmTokens>;
}

/** State shared between the service and the dialog or popup that shows one question. */
export interface TxConfirmState {
  /** Options the question was opened with. */
  options: TxConfirmOptions;
  /** Element id of the message, used for `aria-describedby`. */
  messageId: string;
  /** Whether the `accept` function is still running, which blocks closing. */
  busy: boolean;
}
