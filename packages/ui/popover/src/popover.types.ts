import { TxOverlayCloseReason } from '@tectra/core/overlay';

export type TxPopoverPart = 'root' | 'header' | 'title' | 'content' | 'footer' | 'closeButton' | 'arrow';
export type TxPopoverAutoFocus = 'first' | 'panel' | 'none';
export type TxPopoverCloseReason = TxOverlayCloseReason | 'tab';
export type TxPopoverTarget = Element | Event | null | undefined;

export interface TxPopoverContentContext {
  $implicit: () => void;
  close: () => void;
}
