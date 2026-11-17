import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input, linkedSignal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean, TxTimeSource } from '@tectra-ng/core/utils';
import { TectraAnalogClockTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxAnalogClockPart, TxAnalogClockTime } from './analog-clock.types';
import { clockHands, clockTime, forwardAngle } from './analog-clock.utils';
import { ANALOG_CLOCK_THEME } from './analog-clock.theme';

@Component({
  selector: 'tx-analog-clock',
  template: `
    <div class="tx-analog-clock__face" role="img" [attr.aria-label]="label()" [class]="passThrough().face?.class" [style]="passThrough().face?.style">
      @for (tick of ticks; track tick) {
        <span
          class="tx-analog-clock__tick"
          aria-hidden="true"
          [class.tx-analog-clock__tick--major]="tick % 3 === 0"
          [style.--tx-analog-clock-angle]="tick * 30 + 'deg'"
          [class]="passThrough().tick?.class"
          [style]="passThrough().tick?.style"
        ></span>
      }
      <span
        class="tx-analog-clock__hand tx-analog-clock__hand--hour"
        aria-hidden="true"
        [style.--tx-analog-clock-angle]="hourAngle() + 'deg'"
        [class]="passThrough().hourHand?.class"
        [style]="passThrough().hourHand?.style"
      ></span>
      <span
        class="tx-analog-clock__hand tx-analog-clock__hand--minute"
        aria-hidden="true"
        [style.--tx-analog-clock-angle]="minuteAngle() + 'deg'"
        [class]="passThrough().minuteHand?.class"
        [style]="passThrough().minuteHand?.style"
      ></span>
      @if (showSeconds()) {
        <span
          class="tx-analog-clock__hand tx-analog-clock__hand--second"
          aria-hidden="true"
          [style.--tx-analog-clock-angle]="secondAngle() + 'deg'"
          [class]="passThrough().secondHand?.class"
          [style]="passThrough().secondHand?.style"
        ></span>
      }
      <span class="tx-analog-clock__pin" aria-hidden="true" [class]="passThrough().pin?.class" [style]="passThrough().pin?.style"></span>
    </div>
  `,
  styleUrl: './analog-clock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-analog-clock',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxAnalogClock {
  private readonly analogClockTheme = injectTokens(ANALOG_CLOCK_THEME);

  readonly timezone = input<string | null | undefined>(undefined);
  readonly time = input<TxAnalogClockTime>(undefined);
  readonly showSeconds = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAnalogClockTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAnalogClockPart, TxAnalogClock> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('analogClock', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-analog-clock'), ...this.passThrough().root?.style }));

  protected readonly ticks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  private readonly timeSource = inject(TxTimeSource);

  private readonly fixedTime = computed(() => clockTime(this.time()));
  readonly hands = computed(() => clockHands(this.fixedTime() ?? this.timeSource.every(this.showSeconds() ? 'second' : 'minute')(), this.timezone()));
  readonly label = computed(() => (this.ariaLabel() ? `${this.ariaLabel()}, ${this.hands().time}` : this.hands().time));
  readonly hourAngle = linkedSignal<number, number>({ source: () => this.hands().hourAngle, computation: (next, previous) => forwardAngle(previous?.value ?? null, next) });
  readonly minuteAngle = linkedSignal<number, number>({ source: () => this.hands().minuteAngle, computation: (next, previous) => forwardAngle(previous?.value ?? null, next) });
  readonly secondAngle = linkedSignal<number, number>({ source: () => this.hands().secondAngle, computation: (next, previous) => forwardAngle(previous?.value ?? null, next) });
}
