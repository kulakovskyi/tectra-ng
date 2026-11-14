import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, afterRenderEffect, computed, effect, inject, input, numberAttribute, output, untracked, viewChild } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraNetworkStatusTokens, toStyleObject } from '@tectra-ng/themes';
import { TxNetworkState, TxNetworkStatusPart } from './network-status.types';
import { NETWORK_STATUS_ICON_DEFAULTS } from './network-status.icons';
import { TxNetworkService } from './network.service';
import { NETWORK_STATUS_THEME } from './network-status.theme';

@Component({
  selector: 'tx-network-status',
  imports: [TxIcon],
  template: `
    <div #region class="tx-network-status__region" role="status" aria-live="polite">
      @if (visible()) {
        <div
          #pill
          class="tx-network-status__pill"
          animate.enter="tx-network-status__pill--enter"
          animate.leave="tx-network-status__pill--leave"
          [attr.data-status]="status()"
          [class]="passThrough().pill?.class"
          [style]="passThrough().pill?.style"
        >
          <span class="tx-network-status__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
            <tx-icon [name]="status() === 'restored' ? 'check' : 'wifi'" />
          </span>
          <span class="tx-network-status__text" [class]="passThrough().text?.class" [style]="passThrough().text?.style">{{ message() }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './network-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-network-status',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(NETWORK_STATUS_ICON_DEFAULTS)],
})
export class TxNetworkStatus {
  private readonly networkStatusTheme = injectTokens(NETWORK_STATUS_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly network = inject(TxNetworkService);
  private readonly region = viewChild.required<ElementRef<HTMLElement>>('region');
  private readonly pill = viewChild<ElementRef<HTMLElement>>('pill');

  readonly offlineText = input<string | undefined>(undefined);
  readonly restoredText = input<string | undefined>(undefined);
  readonly restoredDuration = input<number, unknown>(3000, { transform: numberAttribute });
  readonly bodyClass = input<string>('tx-offline');
  readonly dt = input<TectraDeepPartial<TectraNetworkStatusTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxNetworkStatusPart, TxNetworkStatus> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly statusChange = output<TxNetworkState>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('networkStatus', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-network-status'), ...this.passThrough().root?.style }));

  readonly status = this.network.status;
  protected readonly visible = computed(() => this.status() !== 'online');
  protected readonly message = computed(() =>
    this.status() === 'restored' ? (this.restoredText() ?? this.translations().connectionRestored) : (this.offlineText() ?? this.translations().offline),
  );

  constructor() {
    effect(() => this.network.restoredDuration.set(this.restoredDuration()));
    let last = this.status();
    effect(() => {
      const status = this.status();
      if (status !== last) {
        last = status;
        untracked(() => this.statusChange.emit(status));
      }
    });
    effect((onCleanup) => {
      const name = this.bodyClass();
      const body = this.document.body;
      if (!name || !body) {
        return;
      }
      body.classList.toggle(name, this.visible());
      onCleanup(() => body.classList.remove(name));
    });
    afterRenderEffect((onCleanup) => {
      const body = this.document.body;
      const pill = this.visible() ? this.pill()?.nativeElement : undefined;
      if (!body || !pill) {
        return;
      }
      const view = this.document.defaultView;
      const bottom = Number.parseFloat(view?.getComputedStyle(this.region().nativeElement).bottom ?? '') || 0;
      body.style.setProperty(BOTTOM_OFFSET, `${Math.round(bottom + pill.offsetHeight)}px`);
      onCleanup(() => body.style.removeProperty(BOTTOM_OFFSET));
    });
  }

  onOffline(): void {
    this.network.markOffline();
  }

  onOnline(): void {
    this.network.markOnline();
  }
}

const BOTTOM_OFFSET = '--tx-bottom-overlay-offset';
