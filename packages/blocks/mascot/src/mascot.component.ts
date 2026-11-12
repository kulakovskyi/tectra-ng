import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, booleanAttribute, computed, inject, input, signal } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraMascotTokens, toStyleObject } from '@tectra-ng/themes';
import { TX_MASCOT_LEG_LAYERS, TX_MASCOT_SPRITE, TX_MASCOT_TRICKS, TX_MASCOT_TRICK_EVERY_SLOTS, TX_MASCOT_TRICK_SLOT_MS, TX_MASCOT_UPPER_LAYERS } from './mascot.data';
import { TxMascotPart, TxMascotState } from './mascot.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { MASCOT_ICON_DEFAULTS } from './mascot.icons';

@Component({
  selector: 'tx-mascot',
  templateUrl: './mascot.component.html',
  styleUrl: './mascot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-mascot',
    role: 'img',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-state]': 'displayState()',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
  viewProviders: [provideTxIconDefaults(MASCOT_ICON_DEFAULTS)],
})
export class TxMascot {
  readonly state = input<TxMascotState>('idle');
  readonly label = input<string>('');
  readonly playful = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly size = input<number | string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraMascotTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMascotPart, TxMascot> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('mascot', this, this.pt, this.ptOptions);
  readonly viewBox = `0 0 ${TX_MASCOT_SPRITE[0].length} ${TX_MASCOT_SPRITE.length}`;
  readonly upperLayers = TX_MASCOT_UPPER_LAYERS;
  readonly legLayers = TX_MASCOT_LEG_LAYERS;

  private readonly slot = signal(1);
  private readonly trickOffset = Math.floor(Math.random() * TX_MASCOT_TRICKS.length);

  readonly displayState = computed<TxMascotState>(() => {
    const state = this.state();
    const slot = this.slot();
    if (state !== 'idle' || !this.playful() || slot % TX_MASCOT_TRICK_EVERY_SLOTS !== 0) {
      return state;
    }
    return TX_MASCOT_TRICKS[(Math.floor(slot / TX_MASCOT_TRICK_EVERY_SLOTS) + this.trickOffset) % TX_MASCOT_TRICKS.length];
  });
  readonly hostStyle = computed(() => {
    const size = this.size();
    return {
      ...toStyleObject(this.dt(), '--tx-mascot'),
      ...(size !== undefined ? { '--tx-mascot-size': typeof size === 'number' ? `${size}px` : size } : {}),
      ...this.passThrough().root?.style,
    };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const timer = setInterval(() => this.slot.update((slot) => slot + 1), TX_MASCOT_TRICK_SLOT_MS);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
