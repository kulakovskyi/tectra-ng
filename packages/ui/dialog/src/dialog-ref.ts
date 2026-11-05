import { InjectionToken, Signal, inject, signal } from '@angular/core';
import { Observable, ReplaySubject, Subject, firstValueFrom, isObservable } from 'rxjs';
import { TxDialogConfig } from './dialog.types';

export interface TxDialogHost {
  leave(): Promise<void>;
  dispose(): void;
  updateSize(width?: string, height?: string): void;
  dragFrom(event: PointerEvent): void;
}

export const TX_DIALOG_DATA = new InjectionToken<unknown>('TX_DIALOG_DATA');
export const TX_DIALOG_CURRENT = new InjectionToken<Signal<TxDialogRef | null>>('TX_DIALOG_CURRENT');

export class TxDialogRef<R = unknown, C = unknown> {
  private readonly closedSubject = new Subject<R | undefined>();
  private readonly openedSubject = new ReplaySubject<void>(1);
  private readonly maximizedState = signal(false);
  private readonly titleIdState = signal<string | null>(null);
  private host: TxDialogHost | null = null;
  private closing = false;
  private guarding = false;

  readonly closed: Observable<R | undefined> = this.closedSubject.asObservable();
  readonly afterOpened: Observable<void> = this.openedSubject.asObservable();
  readonly maximized: Signal<boolean> = this.maximizedState.asReadonly();
  readonly titleId: Signal<string | null> = this.titleIdState.asReadonly();
  componentInstance: C | null = null;

  constructor(
    readonly id: string,
    readonly config: TxDialogConfig<unknown, R>,
  ) {}

  get isClosing(): boolean {
    return this.closing;
  }

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

  toggleMaximize(): void {
    this.maximizedState.update((maximized) => !maximized);
  }

  maximize(): void {
    this.maximizedState.set(true);
  }

  restore(): void {
    this.maximizedState.set(false);
  }

  updateSize(width?: string, height?: string): void {
    this.host?.updateSize(width, height);
  }

  dragFrom(event: PointerEvent): void {
    this.host?.dragFrom(event);
  }

  registerTitle(id: string): () => void {
    this.titleIdState.set(id);
    return () => {
      if (this.titleIdState() === id) {
        this.titleIdState.set(null);
      }
    };
  }

  attachHost(host: TxDialogHost): void {
    this.host = host;
  }

  markOpened(): void {
    this.openedSubject.next();
    this.openedSubject.complete();
  }
}

export function injectCurrentDialog(): Signal<TxDialogRef | null> {
  const current = inject(TX_DIALOG_CURRENT, { optional: true });
  const ref = inject(TxDialogRef, { optional: true });
  return current ?? signal(ref).asReadonly();
}

export function injectDialogData<D>(): D {
  return inject(TX_DIALOG_DATA) as D;
}

export function injectDialogRef<R = unknown, C = unknown>(): TxDialogRef<R, C> {
  return inject(TxDialogRef) as TxDialogRef<R, C>;
}
