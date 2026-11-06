import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectFluid } from '@tectra-ng/core/fluid';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraInputNumberTokens, toStyleObject } from '@tectra-ng/themes';
import { TxInput } from '@tectra-ng/ui/input';
import {
  TxInputNumberButtonLayout,
  TxInputNumberChangeEvent,
  TxInputNumberCurrencyDisplay,
  TxInputNumberMode,
  TxInputNumberPart,
  TxInputNumberSize,
  TxInputNumberVariant,
} from './input-number.types';
import { TxNumberFormat } from './number-format';

const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 60;

@Component({
  selector: 'tx-input-number',
  imports: [TxInput, TxIcon, NgTemplateOutlet],
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxInputNumber), multi: true }],
  host: {
    class: 'tx-input-number',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'showButtons() ? buttonLayout() : null',
    '[attr.data-size]': 'size()',
    '[class.tx-input-number--fluid]': 'isFluid()',
    '[class.tx-input-number--filled]': 'value() !== null',
    '[class.tx-input-number--invalid]': 'isInvalid()',
    '[class.tx-input-number--disabled]': 'isDisabled()',
  },
})
export class TxInputNumber extends TxFormControlBase<number> {
  private txIconRegistry = inject(TxIconRegistry);
  private localeService = inject(TxLocaleService);
  private generatedId = uniqueId('tx-input-number');
  private repeatTimer: ReturnType<typeof setTimeout> | null = null;

  readonly mode = input<TxInputNumberMode>('decimal');
  readonly currency = input<string | undefined>(undefined);
  readonly currencyDisplay = input<TxInputNumberCurrencyDisplay>('symbol');
  readonly locale = input<string | undefined>(undefined);
  readonly useGrouping = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly minFractionDigits = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly maxFractionDigits = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly prefix = input<string | undefined>(undefined);
  readonly suffix = input<string | undefined>(undefined);
  readonly min = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly max = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly step = input<number, unknown>(1, { transform: numberAttribute });
  readonly showButtons = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly buttonLayout = input<TxInputNumberButtonLayout>('stacked');
  readonly incrementIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly decrementIcon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly allowEmpty = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<TxInputNumberSize>('medium');
  readonly variant = input<TxInputNumberVariant>('outlined');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraInputNumberTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxInputNumberPart, TxInputNumber> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxInputNumberChangeEvent>();
  readonly cleared = output<void>();

  readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isFluid = injectFluid(this.fluid);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('inputNumber', this, this.pt, this.ptOptions);

  readonly isFocused = signal(false);
  readonly resolvedId = computed(() => this.inputId() ?? this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly format = computed(
    () =>
      new TxNumberFormat({
        locale: this.locale() ?? this.localeService.locale().intl,
        mode: this.mode(),
        currency: this.currency(),
        currencyDisplay: this.currencyDisplay(),
        useGrouping: this.useGrouping(),
        minFractionDigits: this.minFractionDigits(),
        maxFractionDigits: this.maxFractionDigits(),
        prefix: this.prefix(),
        suffix: this.suffix(),
      }),
  );
  readonly canIncrement = computed(() => this.isEditable() && (this.max() === undefined || (this.value() ?? 0) < (this.max() as number)));
  readonly canDecrement = computed(() => this.isEditable() && (this.min() === undefined || (this.value() ?? 0) > (this.min() as number)));
  readonly incrementIconName = computed(() => this.iconName(this.incrementIcon(), this.buttonLayout() === 'stacked' ? 'chevron-up' : 'plus'));
  readonly decrementIconName = computed(() => this.iconName(this.decrementIcon(), this.buttonLayout() === 'stacked' ? 'chevron-down' : 'minus'));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-input-number'), ...this.passThrough().root?.style }));

  constructor() {
    super();
    effect(() => {
      this.format();
      if (!this.isFocused()) {
        this.paint(this.format().format(this.value()));
      }
    });
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  override writeValue(value: number | null): void {
    super.writeValue(typeof value === 'number' && !Number.isNaN(value) ? value : null);
    queueMicrotask(() => this.paint(this.format().format(this.value())));
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  onInput(event: Event): void {
    const element = this.inputRef().nativeElement;
    const format = this.format();
    const count = format.countBefore(element.value, element.selectionStart ?? element.value.length);
    const typed = format.formatTyping(this.allowsNegative() ? element.value : element.value.replace('-', ''));
    this.paint(typed.display);
    element.setSelectionRange(format.caretFor(typed.display, count), format.caretFor(typed.display, count));
    this.commit(typed.value, event);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isEditable()) {
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.spin(1, event);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.spin(-1, event);
        break;
      case 'Home':
        if (this.min() !== undefined) {
          event.preventDefault();
          this.commit(this.min() as number, event, true);
        }
        break;
      case 'End':
        if (this.max() !== undefined) {
          event.preventDefault();
          this.commit(this.max() as number, event, true);
        }
        break;
      case 'Enter':
        this.finish(event);
        break;
    }
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(event: Event): void {
    this.isFocused.set(false);
    this.finish(event);
    this.markTouched();
  }

  startRepeat(direction: 1 | -1, event: PointerEvent): void {
    if (event.button !== 0 || !this.isEditable()) {
      return;
    }
    event.preventDefault();
    this.focus();
    this.spin(direction, event);
    this.stopRepeat();
    const repeat = (delay: number) => {
      this.repeatTimer = setTimeout(() => {
        this.spin(direction, event);
        repeat(REPEAT_INTERVAL);
      }, delay);
    };
    repeat(REPEAT_DELAY);
  }

  stopRepeat(): void {
    if (this.repeatTimer) {
      clearTimeout(this.repeatTimer);
      this.repeatTimer = null;
    }
  }

  clear(event: Event): void {
    this.commit(this.allowEmpty() ? null : (this.min() ?? 0), event, true);
    this.cleared.emit();
    this.focus();
  }

  private spin(direction: 1 | -1, event: Event): void {
    const current = this.value() ?? 0;
    const precision = Math.max(decimals(this.step()), decimals(current));
    const next = Number((current + direction * this.step()).toFixed(precision));
    this.commit(this.clamp(next), event, true);
    if ((direction === 1 && !this.canIncrement()) || (direction === -1 && !this.canDecrement())) {
      this.stopRepeat();
    }
  }

  private finish(event: Event): void {
    let next = this.value();
    if (next === null && !this.allowEmpty()) {
      next = this.min() ?? 0;
    }
    next = next === null ? null : this.clamp(next);
    this.commit(next, event, true);
  }

  private commit(value: number | null, event: Event, repaint = false): void {
    if (repaint) {
      this.paint(this.format().format(value));
    }
    if (value !== this.value()) {
      this.updateValue(value);
      this.changed.emit({ value, originalEvent: event });
    }
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
  }

  private allowsNegative(): boolean {
    const min = this.min();
    return min === undefined || min < 0;
  }

  private paint(text: string): void {
    const element = this.inputRef().nativeElement;
    if (element.value !== text) {
      element.value = text;
    }
  }

  private iconName(icon: string | undefined, fallback: string): { name: string | null; className: string | null } {
    const resolved = icon ?? fallback;
    return this.txIconRegistry.has(resolved) ? { name: resolved, className: null } : { name: null, className: resolved };
  }
}

function decimals(value: number): number {
  const text = String(value);
  return text.includes('.') ? text.split('.')[1].length : 0;
}
