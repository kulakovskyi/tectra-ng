import { InjectionToken, Signal, inject, signal } from '@angular/core';
import { Observable, ReplaySubject, Subject, firstValueFrom, isObservable } from 'rxjs';
import { TxDialogConfig } from './dialog.types';

/** What a `TxDialogRef` calls on the container that shows the dialog. */
export interface TxDialogHost {
  /** Plays the closing animation; resolves when it ends. */
  leave(): Promise<void>;
  /** Removes the dialog from the page. */
  dispose(): void;
  /** Sets the width and height of the dialog. */
  updateSize(width?: string, height?: string): void;
  /** Starts moving the dialog from a pointer press on its header. */
  dragFrom(event: PointerEvent): void;
}

/** Holds the `data` a dialog was opened with; read it with `injectDialogData`. */
export const TX_DIALOG_DATA = new InjectionToken<unknown>('TX_DIALOG_DATA');
/** Gives the content of a dialog the signal of its current `TxDialogRef`. */
export const TX_DIALOG_CURRENT = new InjectionToken<Signal<TxDialogRef | null>>('TX_DIALOG_CURRENT');

/** Handle of one open dialog: close it, read its result and state, and reach its content. */
export class TxDialogRef<R = unknown, C = unknown> {
  private readonly closedSubject = new Subject<R | undefined>();
  private readonly openedSubject = new ReplaySubject<void>(1);
  private readonly maximizedState = signal(false);
  private readonly titleIdState = signal<string | null>(null);
  private host: TxDialogHost | null = null;
  private closing = false;
  private guarding = false;

  /** Emits the result once when the dialog closes, `undefined` when it was dismissed. */
  readonly closed: Observable<R | undefined> = this.closedSubject.asObservable();
  /** Emits once the dialog has opened. */
  readonly afterOpened: Observable<void> = this.openedSubject.asObservable();
  /** Whether the dialog is maximized. */
  readonly maximized: Signal<boolean> = this.maximizedState.asReadonly();
  /** Element id of the title that names the dialog; `null` without one. */
  readonly titleId: Signal<string | null> = this.titleIdState.asReadonly();
  /** The content component, or `null` for a template. */
  componentInstance: C | null = null;

  constructor(
    /** Unique id of the dialog. */
    readonly id: string,
    /** Options the dialog was opened with. */
    readonly config: TxDialogConfig<unknown, R>,
  ) {}

  /** Whether the dialog has started closing. */
  get isClosing(): boolean {
    return this.closing;
  }

  /** Closes the dialog with an optional result after `canClose` agrees; resolves to whether it closed. */
  async close(result?: R): Promise<boolean> {
    if (this.closing || this.guarding) {
      return false;
    }
    const guard = this.config.canClose;
    if (guard) {
      this.guarding = true;
      const answer = guard(result);
      const allowed = await Promise.resolve(isObservable(answer) ? firstValueFrom(answer, { defaultValue: false }) : answer).finally(() => (this.guarding = false));
      if (!allowed || this.closing) {
        return false;
      }
    }
    this.closing = true;
    await this.host?.leave();
    this.host?.dispose();
    this.closedSubject.next(result);
    this.closedSubject.complete();
    return true;
  }

  /** Maximizes the dialog or restores it. */
  toggleMaximize(): void {
    this.maximizedState.update((maximized) => !maximized);
  }

  /** Maximizes the dialog. */
  maximize(): void {
    this.maximizedState.set(true);
  }

  /** Brings a maximized dialog back to its size. */
  restore(): void {
    this.maximizedState.set(false);
  }

  /** Sets the width and height of the dialog. */
  updateSize(width?: string, height?: string): void {
    this.host?.updateSize(width, height);
  }

  /** Starts moving the dialog from a pointer press; works with `draggable`. */
  dragFrom(event: PointerEvent): void {
    this.host?.dragFrom(event);
  }

  /** Names the dialog by the element with this id; returns a function that withdraws it. */
  registerTitle(id: string): () => void {
    this.titleIdState.set(id);
    return () => {
      if (this.titleIdState() === id) {
        this.titleIdState.set(null);
      }
    };
  }

  /** Connects the container that shows the dialog; used by `TxDialogService`. */
  attachHost(host: TxDialogHost): void {
    this.host = host;
  }

  /** Reports that the dialog opened, which fires `afterOpened`; used by `TxDialogService`. */
  markOpened(): void {
    this.openedSubject.next();
    this.openedSubject.complete();
  }
}

/** Gives the signal of the dialog the code runs in; `null` outside a dialog. */
export function injectCurrentDialog(): Signal<TxDialogRef | null> {
  const current = inject(TX_DIALOG_CURRENT, { optional: true });
  const ref = inject(TxDialogRef, { optional: true });
  return current ?? signal(ref).asReadonly();
}

/** Reads the `data` the dialog was opened with, inside the dialog content. */
export function injectDialogData<D>(): D {
  return inject(TX_DIALOG_DATA) as D;
}

/** Gives the `TxDialogRef` of the dialog the code runs in, to close it or read its state. */
export function injectDialogRef<R = unknown, C = unknown>(): TxDialogRef<R, C> {
  return inject(TxDialogRef) as TxDialogRef<R, C>;
}
