import { Injector, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { TectraDeepPartial, TectraDialogTokens } from '@tectra-ng/themes';

/**
 * Width step of a dialog: `small` (500px), `medium` (700px), `large` (900px), `xlarge` (1100px) or `fullscreen`.
 */
export type TxDialogSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
/** Where the dialog sits on the screen: the `center`, an edge or a corner. */
export type TxDialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
/** Edge a drawer slides in from: `left`, `right`, `top` or `bottom`. */
export type TxDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
/** Named size of a drawer: `small`, `medium`, `large` or `full`. */
export type TxDrawerSize = 'small' | 'medium' | 'large' | 'full';
/** What gets focus on open: the `first` focusable field, the `dialog` itself, `none`, or a CSS selector. */
export type TxDialogAutoFocus = 'first' | 'dialog' | 'none' | (string & {});
/** ARIA role of the dialog: `dialog`, or `alertdialog` for a question that needs an answer. */
export type TxDialogRole = 'dialog' | 'alertdialog';
/** Names of the parts of `tx-dialog` that `pt` can style. */
export type TxDialogPart = 'root' | 'mask' | 'header' | 'title' | 'subtitle' | 'headerButton' | 'content' | 'footer';
/** Asked before a dialog closes; gives `false`, or a promise or observable of it, to keep the dialog open. */
export type TxDialogGuard<R> = (result: R | undefined) => boolean | Promise<boolean> | Observable<boolean>;

/** Options of one dialog opened with `TxDialogService.open`. */
export interface TxDialogConfig<D = unknown, R = unknown> {
  /** Anything to pass to the content; read it with `injectDialogData`. */
  data?: D;
  /** Values set as inputs of the content component. */
  inputs?: Record<string, unknown>;
  /** Width step of the dialog (default `medium`). */
  size?: TxDialogSize;
  /** Own width as a CSS length; wins over `size`. */
  width?: string;
  /** Smallest width as a CSS length. */
  minWidth?: string;
  /** Largest width as a CSS length. */
  maxWidth?: string;
  /** Own height as a CSS length. */
  height?: string;
  /** Largest height as a CSS length. */
  maxHeight?: string;
  /** Width per viewport width, for example `{ '640px': '90vw' }` narrows the dialog below 640px. */
  breakpoints?: Record<string, string>;
  /** Where the dialog sits (default `center`). */
  position?: TxDialogPosition;
  /** Slides the dialog in from this edge as a drawer. */
  drawer?: TxDrawerPosition;
  /** Drawer size: a named step or a CSS length. */
  drawerSize?: TxDrawerSize | (string & {});
  /** Dims the page and keeps focus inside (default on). */
  modal?: boolean;
  /** Allows closing with the close button, Escape and a click on the mask (default on). */
  closable?: boolean;
  /** Overrides `closable` for the Escape key. */
  closeOnEscape?: boolean;
  /** Overrides `closable` for a click on the mask. */
  dismissableMask?: boolean;
  /** Stops the page from scrolling while open (default on, modal only). */
  blockScroll?: boolean;
  /** Lets the header move the dialog. */
  draggable?: boolean;
  /** Shows a maximize and restore button. */
  maximizable?: boolean;
  /** What gets focus on open (default `first`). */
  autoFocus?: TxDialogAutoFocus;
  /** Returns focus to the element that was focused before opening (default on). */
  restoreFocus?: boolean;
  /** ARIA role of the dialog. */
  role?: TxDialogRole;
  /** Accessible name for a dialog without a header. */
  ariaLabel?: string;
  /** Id of the element that names the dialog. */
  ariaLabelledBy?: string;
  /** Id of the element that describes the dialog. */
  ariaDescribedBy?: string;
  /** Extra class or classes on the dialog panel. */
  panelClass?: string | string[];
  /** Asked before closing; return `false` to keep the dialog open. */
  canClose?: TxDialogGuard<R>;
  /** Design tokens of this one dialog. */
  dt?: TectraDeepPartial<TectraDialogTokens>;
  /** Drops the tectra styles of this dialog. */
  unstyled?: boolean;
  /** Parent injector of the content; the root injector when not set. */
  injector?: Injector;
  /** View container the content is created in, so it inherits that place in the tree. */
  viewContainerRef?: ViewContainerRef;
}

/** Context of a dialog opened from a template. */
export interface TxDialogTemplateContext<D = unknown, R = unknown> {
  /** The `data` of the dialog. */
  $implicit: D | undefined;
  /** Closes the dialog with an optional result. */
  close: (result?: R) => void;
}
