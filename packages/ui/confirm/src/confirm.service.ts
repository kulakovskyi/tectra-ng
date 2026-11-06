import { Injectable, Injector, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxOverlay, TxOverlayRef } from '@tectra-ng/core/overlay';
import { TxDialogService } from '@tectra-ng/ui/dialog';
import { TX_CONFIRM_POPUP, TxConfirmPopup, TxConfirmPopupData } from './confirm-popup.component';
import { TxConfirmDialog } from './confirm-dialog.component';
import { TxConfirmOptions, TxConfirmState } from './confirm.types';

@Injectable({ providedIn: 'root' })
export class TxConfirmService {
  private dialogs = inject(TxDialogService);
  private overlay = inject(TxOverlay);
  private injector = inject(Injector);

  dialog(options: TxConfirmOptions = {}): Promise<boolean> {
    const state = this.state(options);
    const ref = this.dialogs.open<TxConfirmDialog, TxConfirmState, boolean>(TxConfirmDialog, {
      data: state,
      role: 'alertdialog',
      ariaDescribedBy: options.message ? state.messageId : undefined,
      autoFocus: `.tx-confirm__${options.defaultFocus ?? 'reject'}`,
      canClose: () => !state.busy,
    });
    return firstValueFrom(ref.closed, { defaultValue: undefined }).then((result) => result === true);
  }

  popup(target: Element | Event, options: TxConfirmOptions = {}): Promise<boolean> {
    const origin = target instanceof Event ? ((target.currentTarget ?? target.target) as Element) : target;
    const state = this.state(options);
    const ref = signal<TxOverlayRef | null>(null);
    let accepted = false;
    const { width, height } = origin.getBoundingClientRect();
    const data: TxConfirmPopupData = {
      state,
      ref,
      originSize: { width, height },
      finish: (value) => {
        accepted = value;
        ref()?.close('api');
      },
    };
    const overlayRef = this.overlay.open(TxConfirmPopup, {
      origin,
      placement: options.placement ?? 'bottom',
      offset: 10,
      layer: 'popover',
      injector: Injector.create({ parent: this.injector, providers: [{ provide: TX_CONFIRM_POPUP, useValue: data }] }),
    });
    ref.set(overlayRef);
    overlayRef.element.querySelector<HTMLElement>(`.tx-confirm__${options.defaultFocus ?? 'reject'}`)?.focus();
    return firstValueFrom(overlayRef.closed).then(() => accepted);
  }

  private state(options: TxConfirmOptions): TxConfirmState {
    return { options, messageId: uniqueId('tx-confirm-message'), busy: false };
  }
}
