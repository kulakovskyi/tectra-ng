import { Injector, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { TectraDeepPartial, TectraDialogTokens } from '@tectra-ng/themes';

export type TxDialogSize = 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen';
export type TxDialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TxDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type TxDrawerSize = 'small' | 'medium' | 'large' | 'full';
export type TxDialogAutoFocus = 'first' | 'dialog' | 'none' | (string & {});
export type TxDialogRole = 'dialog' | 'alertdialog';
export type TxDialogPart = 'root' | 'mask' | 'header' | 'title' | 'subtitle' | 'headerButton' | 'content' | 'footer';
export type TxDialogGuard<R> = (result: R | undefined) => boolean | Promise<boolean> | Observable<boolean>;

export interface TxDialogConfig<D = unknown, R = unknown> {
  data?: D;
  inputs?: Record<string, unknown>;
  size?: TxDialogSize;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
  breakpoints?: Record<string, string>;
  position?: TxDialogPosition;
  drawer?: TxDrawerPosition;
  drawerSize?: TxDrawerSize | (string & {});
  modal?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  draggable?: boolean;
  maximizable?: boolean;
  autoFocus?: TxDialogAutoFocus;
  restoreFocus?: boolean;
  role?: TxDialogRole;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  panelClass?: string | string[];
  canClose?: TxDialogGuard<R>;
  dt?: TectraDeepPartial<TectraDialogTokens>;
  unstyled?: boolean;
  injector?: Injector;
  viewContainerRef?: ViewContainerRef;
}

export interface TxDialogTemplateContext<D = unknown, R = unknown> {
  $implicit: D | undefined;
  close: (result?: R) => void;
}
