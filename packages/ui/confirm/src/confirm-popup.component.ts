import { FocusTrapFactory } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, InjectionToken, Signal, computed, inject } from '@angular/core';
import { TxOverlayRef, TxPlacement, parsePlacement, txArrowOffset } from '@tectra-ng/core/overlay';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { confirmView } from './confirm-content';
import { TxConfirmState } from './confirm.types';
import { CONFIRM_ICON_DEFAULTS } from './confirm.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { CONFIRM_THEME } from './confirm.theme';

/** Data of one popup question: its state, overlay and how to finish it. */
export interface TxConfirmPopupData {
  /** State of the question. */
  state: TxConfirmState;
  /** Overlay of the popup; `null` until it is opened. */
  ref: Signal<TxOverlayRef | null>;
  /** Size of the element the popup opened from. */
  originSize: { width: number; height: number };
  /** Closes the popup with the answer. */
  finish: (accepted: boolean) => void;
}

/** Hands the data of one popup question to `TxConfirmPopup`. */
export const TX_CONFIRM_POPUP = new InjectionToken<TxConfirmPopupData>('TX_CONFIRM_POPUP');

/** Content of the confirmation question opened by `TxConfirmService.popup()`. */
@Component({
  selector: 'tx-confirm-popup',
  imports: [TxButton, TxIcon],
  template: `
    <span class="tx-confirm-popup__arrow" aria-hidden="true"></span>
    <div class="tx-confirm" [attr.data-severity]="view.severity">
      @if (view.icon) {
        <span class="tx-confirm__icon" aria-hidden="true"><tx-icon [name]="view.icon" /></span>
      }
      <div class="tx-confirm__text">
        @if (data.state.options.title) {
          <p class="tx-confirm__title">{{ view.title() }}</p>
        }
        @if (view.message) {
          <p class="tx-confirm__message" [id]="data.state.messageId">{{ view.message }}</p>
        }
      </div>
    </div>
    <div class="tx-confirm-popup__actions">
      <button
        txButton
        class="tx-confirm__reject"
        size="small"
        severity="secondary"
        [text]="true"
        [disabled]="view.busy()"
        (click)="data.finish(false)"
      >
        {{ view.rejectLabel() }}
      </button>
      <button
        txButton
        class="tx-confirm__accept"
        size="small"
        [severity]="view.severity"
        [icon]="view.acceptIcon"
        [loading]="view.busy()"
        (click)="view.accept(data.finish)"
      >
        {{ view.acceptLabel() }}
      </button>
    </div>
  `,
  styleUrl: './confirm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-confirm-popup',
    role: 'alertdialog',
    'aria-modal': 'true',
    '[attr.aria-label]': 'view.title()',
    '[attr.aria-describedby]': 'view.message ? data.state.messageId : null',
    '[attr.data-side]': 'side()',
    '[style]': 'hostStyle()',
  },
  viewProviders: [provideTxIconDefaults(CONFIRM_ICON_DEFAULTS)],
})
export class TxConfirmPopup {
  private readonly confirmTheme = injectTokens(CONFIRM_THEME);

  readonly data = inject(TX_CONFIRM_POPUP);
  readonly view = confirmView(this.data.state);
  readonly placement = computed<TxPlacement>(() => this.data.ref()?.placement() ?? this.data.state.options.placement ?? 'bottom');
  readonly side = computed(() => parsePlacement(this.placement()).side);
  readonly arrowOffset = computed(() => txArrowOffset(this.placement(), this.data.originSize, 'var(--tx-confirm-popup-arrow-inset)'));
  readonly hostStyle = computed(() => ({ ...this.view.style, '--tx-confirm-arrow-offset': this.arrowOffset() }));

  constructor() {
    const trap = inject(FocusTrapFactory).create(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(() => trap.destroy());
  }
}
