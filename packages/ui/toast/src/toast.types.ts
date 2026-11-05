import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

export type TxToastSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
export type TxToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type TxToastCloseReason = 'timeout' | 'close' | 'action' | 'api' | 'clear';
export type TxToastPart = 'root' | 'item' | 'icon' | 'body' | 'title' | 'text' | 'actions' | 'closeButton' | 'progress';
export type TxToastActionSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';

export interface TxToastAction {
  label: string;
  run?: (toast: TxToastRef) => void;
  severity?: TxToastActionSeverity;
  keepOpen?: boolean;
}

export interface TxToastContext {
  $implicit: TxToastMessage;
  close: () => void;
}

export interface TxToastOptions<TData = unknown> {
  key?: string;
  severity?: TxToastSeverity;
  title?: string;
  text?: string;
  icon?: string | false;
  loading?: boolean;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  showProgress?: boolean;
  actions?: TxToastAction[];
  template?: TemplateRef<TxToastContext>;
  data?: TData;
}

export interface TxToastMessage<TData = unknown> {
  readonly id: number;
  readonly key: string | undefined;
  readonly severity: TxToastSeverity;
  readonly title: string | undefined;
  readonly text: string | undefined;
  readonly icon: string | false | undefined;
  readonly loading: boolean;
  readonly life: number;
  readonly sticky: boolean;
  readonly closable: boolean;
  readonly showProgress: boolean;
  readonly actions: TxToastAction[];
  readonly template: TemplateRef<TxToastContext> | undefined;
  readonly data: TData | undefined;
  readonly version: number;
  readonly paused: boolean;
}

export interface TxToastRef {
  readonly id: number;
  readonly closed: Observable<TxToastCloseReason>;
  close(): void;
  update(options: Partial<TxToastOptions>): void;
}
