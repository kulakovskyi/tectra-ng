import { Injectable, InjectionToken, Provider, inject, signal } from '@angular/core';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { Subject } from 'rxjs';
import { TxToastAction, TxToastCloseReason, TxToastMessage, TxToastOptions, TxToastRef } from './toast.types';

/** App-wide default options of every toast; set with `provideTxToast`. */
export const TX_TOAST_OPTIONS = new InjectionToken<Partial<TxToastOptions>>('TX_TOAST_OPTIONS');

/** Sets app-wide default options of every toast, e.g. `provideTxToast({ life: 8000 })`. */
export function provideTxToast(options: Partial<TxToastOptions>): Provider {
  return { provide: TX_TOAST_OPTIONS, useValue: options };
}

const DEFAULT_LIFE = 3000;

/** Options of the shortcut methods: all but the severity and the text, which the method sets. */
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

/** Sends toasts from anywhere; one `<tx-toast />` in the app shell shows them. */
@Injectable({ providedIn: 'root' })
export class TxToastService {
  private announcer = inject(TxAnnouncer);
  private defaults = inject(TX_TOAST_OPTIONS, { optional: true }) ?? {};
  private entries = new Map<number, TxToastEntry>();
  private nextId = 1;
  private readonly messages = signal<TxToastMessage[]>([]);

  /** Signal of the toasts that are shown now. */
  readonly toasts = this.messages.asReadonly();

  /** Shows a toast and returns its reference. */
  show(options: TxToastOptions): TxToastRef {
    const id = this.nextId++;
    const closed = new Subject<TxToastCloseReason>();
    const ref: TxToastRef = {
      id,
      closed: closed.asObservable(),
      /** Closes the toast with the id; the reason is `api` by default. */
      close: () => this.close(id, 'api'),
      /** Changes the toast with the id and restarts its timer. */
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

  /** Shows a `success` toast with the text. */
  success(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'success', text });
  }

  /** Shows an `info` toast with the text. */
  info(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'info', text });
  }

  /** Shows a `warn` toast with the text. */
  warn(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'warn', text });
  }

  /** Shows a `danger` toast with the text. */
  error(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, severity: 'danger', text });
  }

  /** Shows a sticky toast with a spinner; update it with a severity when the work ends. */
  loading(text: string, options: TxToastText = {}): TxToastRef {
    return this.show({ ...options, loading: true, text });
  }

  /** Closes one toast by its id; `closed` of its ref emits the reason (`api` by default). */
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

  /** Closes all toasts, or only those of one `key`. */
  clear(key?: string): void {
    for (const entry of [...this.entries.values()]) {
      if (key === undefined || entry.message.key === key) {
        this.close(entry.message.id, 'clear');
      }
    }
  }

  /** Changes a toast that is shown: its text, severity, actions or life time. */
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

  /** Runs an action of the toast and closes it unless the action has `keepOpen`. */
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

  /** Stops the timer of the toast; calls nest, so every `pause` needs a `resume`. */
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

  /** Releases one `pause`; the timer continues when none is left. */
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
