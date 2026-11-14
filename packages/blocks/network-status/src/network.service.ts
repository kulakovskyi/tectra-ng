import { DOCUMENT, DestroyRef, Injectable, afterNextRender, inject, signal } from '@angular/core';
import { TxNetworkState } from './network-status.types';

const RESTORED_DURATION = 3000;

/**
 * The connection state of the app as a signal, fed by the browser `offline` / `online` events and
 * `navigator.onLine`; `markOffline()` and `markOnline()` set it from code, e.g. after a failed request.
 * On the server it stays `online`.
 */
@Injectable({ providedIn: 'root' })
export class TxNetworkService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal<TxNetworkState>('online');
  private restoreTimer: ReturnType<typeof setTimeout> | undefined;

  /** `online`, `offline`, or `restored` for a moment after the connection came back. */
  readonly status = this.state.asReadonly();
  /** How long `restored` lasts before the state turns `online`, in ms (default 3000). */
  readonly restoredDuration = signal(RESTORED_DURATION);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => clearTimeout(this.restoreTimer));
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) {
        return;
      }
      if (view.navigator?.onLine === false) {
        this.markOffline();
      }
      const offline = () => this.markOffline();
      const online = () => this.markOnline();
      view.addEventListener('offline', offline);
      view.addEventListener('online', online);
      destroyRef.onDestroy(() => {
        view.removeEventListener('offline', offline);
        view.removeEventListener('online', online);
      });
    });
  }

  /** Sets the state to `offline`. */
  markOffline(): void {
    clearTimeout(this.restoreTimer);
    this.state.set('offline');
  }

  /** Sets the state to `restored` when it was `offline`, and to `online` after `restoredDuration`. */
  markOnline(): void {
    if (this.state() !== 'offline') {
      return;
    }
    this.state.set('restored');
    clearTimeout(this.restoreTimer);
    this.restoreTimer = setTimeout(() => {
      if (this.state() === 'restored') {
        this.state.set('online');
      }
    }, this.restoredDuration());
  }
}
