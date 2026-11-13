import { TxOverlayCloseReason } from '@tectra-ng/core/overlay';

/** Parts of `tx-popover` that `pt` can style. */
export type TxPopoverPart = 'root' | 'header' | 'title' | 'content' | 'footer' | 'closeButton' | 'arrow';
/** Where focus goes when a popover opens: the `first` focusable element, the `panel` or `none`. */
export type TxPopoverAutoFocus = 'first' | 'panel' | 'none';
/** Why a popover closed: an overlay close reason or `tab` when focus left with the Tab key. */
export type TxPopoverCloseReason = TxOverlayCloseReason | 'tab';
/**
 * What a popover opens at: an element, an event (its current target), or nothing for the last or first
 * trigger.
 */
export type TxPopoverTarget = Element | Event | null | undefined;

/** Context of the popover content template. */
export interface TxPopoverContentContext {
  /** Function that closes the popover. */
  $implicit: () => void;
  /** Function that closes the popover. */
  close: () => void;
}
