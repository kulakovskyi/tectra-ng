import { ChangeDetectionStrategy, Component, computed, input, numberAttribute, signal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraConfettiTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TX_CONFETTI_PIECES, TxConfettiPart, TxConfettiPiece } from './confetti.types';
import { CONFETTI_THEME } from './confetti.theme';

@Component({
  selector: 'tx-confetti',
  template: `
    @for (run of runs(); track run) {
      @for (piece of pieces(); track $index; let index = $index) {
        <span
          class="tx-confetti__piece"
          [attr.data-tone]="piece.tone"
          [style.--tx-confetti-x.px]="piece.x"
          [style.--tx-confetti-y.px]="piece.y"
          [style.--tx-confetti-r.deg]="piece.rotate"
          [style.--tx-confetti-i]="index"
          [class]="passThrough().piece?.class"
          [style]="passThrough().piece?.style"
        ></span>
      }
    }
  `,
  styleUrl: './confetti.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-confetti',
    'aria-hidden': 'true',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[style.--tx-confetti-delay.ms]': 'delay()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxConfetti {
  private readonly confettiTheme = injectTokens(CONFETTI_THEME);

  readonly pieces = input<readonly TxConfettiPiece[]>(TX_CONFETTI_PIECES);
  readonly delay = input<number, unknown>(0, { transform: numberAttribute });
  readonly dt = input<TectraDeepPartial<TectraConfettiTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxConfettiPart, TxConfetti> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('confetti', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-confetti'), ...this.passThrough().root?.style }));

  private readonly run = signal(0);
  protected readonly runs = computed(() => [this.run()]);

  play(): void {
    this.run.update((run) => run + 1);
  }
}
