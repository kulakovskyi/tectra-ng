import { Injectable, InjectionToken, Provider, inject, signal } from '@angular/core';
import { TxAnnouncer } from '@tectra/core/a11y';
import { Subject } from 'rxjs';
import { TxToastAction, TxToastCloseReason, TxToastMessage, TxToastOptions, TxToastRef } from './toast.types';

export const TX_TOAST_OPTIONS = new InjectionToken<Partial<TxToastOptions>>('TX_TOAST_OPTIONS');

export function provideTxToast(options: Partial<TxToastOptions>): Provider {
  return { provide: TX_TOAST_OPTIONS, useValue: options };
}

const DEFAULT_LIFE = 5000;

type TxToastText = Omit<TxToastOptions, 'severity' | 'text'>;

interface TxToastEntry {
  options: TxToastOptions;
  message: TxToastMessage;
  closed: Subject<TxToastCloseReason>;
  ref: TxToastRef;
  timer: ReturnType<typeof setTimeout> | undefined;
  startedAt: number;
  remaining: number;
  pauses: number;
}

@Injectable({ providedIn: 'root' })
export class TxToastService {
  private announcer = inject(TxAnnouncer);
  private defaults = inject(TX_TOAST_OPTIONS, { optional: true }) ?? {};
  private entries = new Map<number, TxToastEntry>();
  private nextId = 1;
  private readonly messages = signal<TxToastMessage[]>([]);

  readonly toasts = this.messages.asReadonly();

  show(options: TxToastOptions): TxToastRef {
    const id = this.nextId++;
    const closed = new Subject<TxToastCloseReason>();
    const ref: TxToastRef = {
      id,
      closed: closed.asObservable(),
      close: () => this.close(id, 'api'),
      update: (patch) => this.update(id, patch),
    };
    const message = this.build(id, options, 0);
    const entry: TxToastEntry = { options, message, closed, ref, timer: undefined, startedAt: 0, remaining: message.life, pauses: 0 };
    this.entries.set(id, entry);
    this.messages.update((list) => [...list, message]);
    this.announce(message);
    this.schedule(entry);
    return ref;
  }

  success(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'success', text });
  }

  info(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'info', text });
  }

  warn(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'warn', text });
  }

  error(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'danger', text });
  }

  loading(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, loading: true, text });
  }

  close(id: number, reason: TxToastCloseReason = 'api'): void {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    clearTimeout(entry.timer);
    this.entries.delete(id);
    this.messages.update((list) => list.filter((message) => message.id !== id));
    entry.closed.next(reason);
    entry.closed.complete();
  }

  clear(key?: string): void {
    for (const entry of [...this.entries.values()]) {
      if (key === undefined || entry.message.key === key) {
        this.close(entry.message.id, 'clear');
      }
    }
  }

  update(id: number, patch: Partial<TxToastOptions>): void {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    const settled = patch.severity !== undefined && patch.loading === undefined ? { loading: false } : {};
    entry.options = { ...entry.options, ...settled, ...patch };
    const previous = entry.message;
    entry.message = this.build(id, entry.options, previous.version + 1, entry.pauses > 0);
    this.replace(entry.message);
    if (previous.title !== entry.message.title || previous.text !== entry.message.text) {
      this.announce(entry.message);
    }
    clearTimeout(entry.timer);
    entry.timer = undefined;
    entry.remaining = entry.message.life;
    if (entry.pauses === 0) {
      this.schedule(entry);
    }
  }

  run(id: number, action: TxToastAction): void {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    action.run?.(entry.ref);
    if (!action.keepOpen) {
      this.close(id, 'action');
    }
  }

  pause(id: number): void {
    const entry = this.entries.get(id);
    if (!entry || entry.pauses++ > 0) {
      return;
    }
    if (entry.timer !== undefined) {
      clearTimeout(entry.timer);
      entry.timer = undefined;
      entry.remaining = Math.max(0, entry.remaining - (this.now() - entry.startedAt));
    }
    this.replace((entry.message = { ...entry.message, paused: true }));
  }

  resume(id: number): void {
    const entry = this.entries.get(id);
    if (!entry || entry.pauses === 0 || --entry.pauses > 0) {
      return;
    }
    this.replace((entry.message = { ...entry.message, paused: false }));
    this.schedule(entry);
  }

  private build(id: number, options: TxToastOptions, version: number, paused = false): TxToastMessage {
    const merged = { ...this.defaults, ...options };
    const loading = merged.loading ?? false;
    return {
      id,
      key: merged.key,
      severity: merged.severity ?? 'info',
      title: merged.title,
      text: merged.text,
      icon: merged.icon,
      loading,
      life: merged.life ?? DEFAULT_LIFE,
      sticky: merged.sticky ?? loading,
      closable: merged.closable ?? !loading,
      showProgress: merged.showProgress ?? false,
      actions: merged.actions ?? [],
      template: merged.template,
      data: merged.data,
      version,
      paused,
    };
  }

  private schedule(entry: TxToastEntry): void {
    const { message } = entry;
    if (message.sticky || message.life <= 0) {
      return;
    }
    entry.startedAt = this.now();
    entry.timer = setTimeout(() => this.close(message.id, 'timeout'), entry.remaining);
  }

  private replace(message: TxToastMessage): void {
    this.messages.update((list) => list.map((item) => (item.id === message.id ? message : item)));
  }

  private announce(message: TxToastMessage): void {
    const text = [message.title, message.text].filter(Boolean).join('. ');
    if (text) {
      void this.announcer.announce(text, message.severity === 'danger' || message.severity === 'warn' ? 'assertive' : 'polite');
    }
  }

  private now(): number {
    return Date.now();
  }
}
