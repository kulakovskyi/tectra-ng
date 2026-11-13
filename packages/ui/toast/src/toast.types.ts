import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

/** Colour role of a toast. */
export type TxToastSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
/** Where the toast outlet sits on the screen. */
export type TxToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
/** Why a toast closed: time ran out, close button, an action, the API or `clear`. */
export type TxToastCloseReason = 'timeout' | 'close' | 'action' | 'api' | 'clear';
/** Parts of `tx-toast` that `pt` can style. */
export type TxToastPart = 'root' | 'item' | 'icon' | 'body' | 'title' | 'text' | 'actions' | 'closeButton' | 'progress';
/** Colour role of a toast action button. */
export type TxToastActionSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';

/** A button inside a toast. */
export interface TxToastAction {
  /** Text of the button. */
  label: string;
  /** Called with the toast reference when the button is pressed. */
  run?: (toast: TxToastRef) => void;
  /** Colour role of the button. */
  severity?: TxToastActionSeverity;
  /** Keeps the toast open after the action ran; by default the action closes it. */
  keepOpen?: boolean;
}

/** Context of a custom toast template (`txToastTemplate` or the `template` option). */
export interface TxToastContext {
  /** The toast being shown. */
  $implicit: TxToastMessage;
  /** Closes the toast. */
  close: () => void;
}

/** Options of one toast: text, severity, life time and actions. */
export interface TxToastOptions<TData = unknown> {
  /** Shows the toast only in the outlet with the same `key`. */
  key?: string;
  /** Colour role and default icon of the toast (default `info`). */
  severity?: TxToastSeverity;
  /** Bold line; with a `text` it is read by screen readers only. */
  title?: string;
  /** Message of the toast. */
  text?: string;
  /** Icon name that replaces the severity icon; `false` shows none. */
  icon?: string | false;
  /** Shows a spinner; the toast is sticky and not closable until it is updated with a severity. */
  loading?: boolean;
  /** How long the toast stays, in ms; `0` keeps it until closed (default 3000). */
  life?: number;
  /** Keeps the toast until it is closed. */
  sticky?: boolean;
  /** Shows the close button (default `true`, `false` while loading). */
  closable?: boolean;
  /** Shows a bar with the time left. */
  showProgress?: boolean;
  /** Buttons under the text. */
  actions?: TxToastAction[];
  /** Own content that replaces the default body. */
  template?: TemplateRef<TxToastContext>;
  /** Any data for a custom template. */
  data?: TData;
}

/** A shown toast: its options with the defaults applied. */
export interface TxToastMessage<TData = unknown> {
  /** Unique number of the toast. */
  readonly id: number;
  /** Key of the outlet that shows the toast. */
  readonly key: string | undefined;
  /** Colour role of the toast. */
  readonly severity: TxToastSeverity;
  /** Bold line of the toast. */
  readonly title: string | undefined;
  /** Message of the toast. */
  readonly text: string | undefined;
  /** Own icon name; `false` shows none. */
  readonly icon: string | false | undefined;
  /** Whether the toast shows a spinner. */
  readonly loading: boolean;
  /** How long the toast stays, in ms; `0` keeps it until closed. */
  readonly life: number;
  /** Whether the toast stays until it is closed. */
  readonly sticky: boolean;
  /** Whether the close button is shown. */
  readonly closable: boolean;
  /** Whether the bar with the time left is shown. */
  readonly showProgress: boolean;
  /** Buttons under the text. */
  readonly actions: TxToastAction[];
  /** Own content that replaces the default body. */
  readonly template: TemplateRef<TxToastContext> | undefined;
  /** Data for a custom template. */
  readonly data: TData | undefined;
  /** Grows with every update of the toast, so a changed toast can be told apart. */
  readonly version: number;
  /** Whether the timer is paused (pointer over the stack or focus inside). */
  readonly paused: boolean;
}

/** Handle of a shown toast: close it, update it or wait for it to close. */
export interface TxToastRef {
  /** Unique number of the toast. */
  readonly id: number;
  /** Emits the close reason once, then completes. */
  readonly closed: Observable<TxToastCloseReason>;
  /** Closes the toast. */
  close(): void;
  /** Changes the toast and restarts its timer. */
  update(options: Partial<TxToastOptions>): void;
}
