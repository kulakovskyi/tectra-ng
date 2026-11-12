import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, booleanAttribute, computed, contentChild, effect, inject, input, numberAttribute, output, signal, untracked } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraCountdownTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxCountdownValue } from './countdown.templates';
import { TxCountdownContext, TxCountdownFormat, TxCountdownPart, TxCountdownTarget, TxCountdownUnit } from './countdown.types';
import { TX_COUNTDOWN_UNIT_MS, formatRemaining, splitRemaining, targetTime } from './countdown.utils';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { COUNTDOWN_ICON_DEFAULTS } from './countdown.icons';
import { COUNTDOWN_THEME } from './countdown.theme';

@Component({
  selector: 'tx-countdown',
  imports: [NgTemplateOutlet],
  template: `
    @if (valueTemplate(); as template) {
      <ng-container [ngTemplateOutlet]="template.templateRef" [ngTemplateOutletContext]="context()" />
    } @else {
      {{ text() }}
    }
  `,
  styleUrl: './countdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-countdown',
    role: 'timer',
    'aria-atomic': 'true',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-live]': 'ariaLive()',
    '[class.tx-countdown--ending]': 'isEnding()',
    '[class.tx-countdown--expired]': 'isExpired()',
    '[class.tx-countdown--paused]': 'paused()',
  },
  viewProviders: [provideTxIconDefaults(COUNTDOWN_ICON_DEFAULTS)],
})
export class TxCountdown {
  private readonly countdownTheme = injectTokens(COUNTDOWN_THEME);

  readonly value = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly unit = input<TxCountdownUnit>('seconds');
  readonly target = input<TxCountdownTarget>(undefined);
  readonly suffix = input<string>('');
  readonly format = input<TxCountdownFormat | undefined>(undefined);
  readonly endingSoon = input<number, unknown>(0, { transform: numberAttribute });
  readonly paused = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLive = input<'off' | 'polite' | 'assertive'>('off');
  readonly dt = input<TectraDeepPartial<TectraCountdownTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCountdownPart, TxCountdown> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly completed = output<void>();
  readonly tick = output<number>();

  protected readonly valueTemplate = contentChild(TxCountdownValue);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('countdown', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-countdown'), ...this.passThrough().root?.style }));

  private readonly now = signal(Date.now());
  private readonly deadline = signal<number | null>(null);
  private readonly frozen = signal<number | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private done = false;

  readonly resolvedFormat = computed<TxCountdownFormat>(() => this.format() ?? (this.target() !== undefined && this.value() === undefined ? 'clock' : 'number'));
  readonly remainingMs = computed(() => {
    const frozen = this.frozen();
    if (frozen !== null) return frozen;
    const deadline = this.deadline();
    return deadline === null ? 0 : Math.max(0, deadline - this.now());
  });
  readonly isExpired = computed(() => this.deadline() !== null && this.remainingMs() === 0);
  readonly isEnding = computed(() => this.remainingMs() > 0 && this.remainingMs() <= this.endingSoon());
  readonly text = computed(() => {
    const remaining = this.remainingMs();
    const display = this.resolvedFormat() === 'clock' ? formatRemaining(Math.ceil(remaining / 1000) * 1000) : String(Math.ceil(remaining / TX_COUNTDOWN_UNIT_MS[this.unit()]));
    return this.suffix() ? `${display} ${this.suffix()}` : display;
  });
  readonly context = computed<TxCountdownContext>(() => ({ $implicit: this.remainingMs(), ...splitRemaining(this.remainingMs()), expired: this.isExpired() }));

  private readonly start = effect(() => {
    const value = this.value();
    const unit = this.unit();
    const target = targetTime(this.target());
    untracked(() => {
      this.done = false;
      this.now.set(Date.now());
      const deadline = value !== undefined ? Date.now() + value * TX_COUNTDOWN_UNIT_MS[unit] : target;
      if (this.paused()) {
        this.deadline.set(deadline);
        this.frozen.set(deadline === null ? null : Math.max(0, deadline - Date.now()));
      } else {
        this.frozen.set(null);
        this.deadline.set(deadline);
      }
    });
  });

  private readonly pause = effect(() => {
    const paused = this.paused();
    untracked(() => {
      if (paused && this.frozen() === null && this.deadline() !== null) this.frozen.set(this.remainingMs());
      if (!paused && this.frozen() !== null) {
        this.deadline.set(Date.now() + (this.frozen() as number));
        this.now.set(Date.now());
        this.frozen.set(null);
      }
    });
  });

  private readonly refresh = effect(() => {
    this.resolvedFormat();
    this.endingSoon();
    untracked(() => this.now.set(Date.now()));
  });

  private readonly schedule = effect((onCleanup) => {
    const deadline = this.deadline();
    const frozen = this.frozen();
    this.now();
    if (deadline === null || frozen !== null) return;
    const remaining = deadline - Date.now();
    if (remaining <= 0) return;
    const step = this.resolvedFormat() === 'clock' || this.endingSoon() ? 1000 : TX_COUNTDOWN_UNIT_MS[this.unit()];
    const delay = remaining % step || step;
    this.timer = setTimeout(() => this.now.set(Date.now()), delay + 5);
    onCleanup(() => {
      if (this.timer) clearTimeout(this.timer);
    });
  });

  private readonly finish = effect(() => {
    const remaining = this.remainingMs();
    const expired = this.isExpired();
    untracked(() => {
      this.tick.emit(remaining);
      if (expired && !this.done) {
        this.done = true;
        this.completed.emit();
      }
    });
  });

  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    if (this.timer) clearTimeout(this.timer);
  });
}
