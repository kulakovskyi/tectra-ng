import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, forwardRef, input, output, viewChildren } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraColorSwatchesTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxColorSwatchOption, TxColorSwatchesChangeEvent, TxColorSwatchesPart, TxColorSwatchesSize } from './color-swatches.types';
import { COLOR_SWATCHES_THEME } from './color-swatches.theme';
import { COLOR_SWATCHES_ICON_DEFAULTS } from './color-swatches.icons';

const STEPS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** A radio group of color dots: picks one value from a few colors, like a theme color or a label color. */
@Component({
  selector: 'tx-color-swatches',
  imports: [TxIcon],
  templateUrl: './color-swatches.component.html',
  styleUrl: './color-swatches.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxColorSwatches), multi: true }],
  host: {
    class: 'tx-color-swatches',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-color-swatches--disabled]': 'isDisabled()',
    '[class.tx-color-swatches--readonly]': 'readonly()',
    '[class.tx-color-swatches--invalid]': 'isInvalid()',
  },
  viewProviders: [provideTxIconDefaults(COLOR_SWATCHES_ICON_DEFAULTS)],
})
export class TxColorSwatches<T = string> extends TxFormControlBase<T> {
  private readonly colorSwatchesTheme = injectTokens(COLOR_SWATCHES_THEME);

  readonly options = input<readonly TxColorSwatchOption<T>[]>([]);
  readonly columns = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly size = input<TxColorSwatchesSize>('medium');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraColorSwatchesTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxColorSwatchesPart, TxColorSwatches<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxColorSwatchesChangeEvent<T>>();

  private readonly swatches = viewChildren<ElementRef<HTMLButtonElement>>('swatch');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('colorSwatches', this, this.pt, this.ptOptions);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly selectedIndex = computed(() => this.options().findIndex((option) => Object.is(option.value, this.value())));
  readonly focusIndex = computed(() => {
    const selected = this.selectedIndex();
    return selected >= 0 && !this.options()[selected].disabled ? selected : this.options().findIndex((option) => !option.disabled);
  });
  readonly groupStyle = computed(() => {
    const columns = this.columns();
    return { ...(columns ? { 'grid-template-columns': `repeat(${columns}, max-content)` } : {}), ...this.passThrough().group?.style };
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-color-swatches'), ...this.passThrough().root?.style }));

  /** Moves focus to the picked dot, or to the first one that can be picked. */
  focus(): void {
    this.swatches()[this.focusIndex()]?.nativeElement.focus();
  }

  select(index: number, event: Event): void {
    const option = this.options()[index];
    if (!option || option.disabled || this.isDisabled() || this.readonly() || index === this.selectedIndex()) {
      return;
    }
    this.updateValue(option.value);
    this.changed.emit({ value: option.value, originalEvent: event });
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const next = this.nextIndex(event.key, index);
    if (next < 0) {
      return;
    }
    event.preventDefault();
    this.swatches()[next].nativeElement.focus();
    this.select(next, event);
  }

  onBlur(): void {
    this.markTouched();
  }

  private nextIndex(key: string, index: number): number {
    const enabled = this.options()
      .map((option, position) => (option.disabled ? -1 : position))
      .filter((position) => position >= 0);
    if (key === 'Home' || key === 'End') {
      return key === 'Home' ? enabled[0] : enabled[enabled.length - 1];
    }
    if (!(key in STEPS)) {
      return -1;
    }
    const current = enabled.indexOf(index);
    return enabled[(current + STEPS[key] + enabled.length) % enabled.length];
  }
}
