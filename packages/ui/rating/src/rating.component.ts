import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, forwardRef, inject, input, numberAttribute, output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraRatingTokens, toStyleObject } from '@tectra/themes';
import { TxRatingOffIconTemplate, TxRatingOnIconTemplate } from './rating-templates.directive';
import { TxRatingChangeEvent, TxRatingPart, TxRatingSize } from './rating.types';

@Component({
  selector: 'tx-rating',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxRating), multi: true }],
  host: {
    class: 'tx-rating',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-rating--readonly]': 'readonly()',
    '[class.tx-rating--disabled]': 'isDisabled()',
    '[class.tx-rating--invalid]': 'isInvalid()',
    '[class.tx-rating--preview]': 'preview() !== null',
  },
})
export class TxRating extends TxFormControlBase<number> {
  private txIconRegistry = inject(TxIconRegistry);
  private localeService = inject(TxLocaleService);

  readonly stars = input<number, unknown>(5, { transform: numberAttribute });
  readonly allowHalf = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly onIcon = input<TxIconName | (string & {})>('star-fill');
  readonly offIcon = input<TxIconName | (string & {})>('star');
  readonly clearable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly clearLabel = input<string | undefined>(undefined);
  readonly size = input<TxRatingSize>('medium');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  readonly dt = input<TectraDeepPartial<TectraRatingTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxRatingPart, TxRating> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly rated = output<TxRatingChangeEvent>();
  readonly cleared = output<void>();

  readonly onTemplate = contentChild(TxRatingOnIconTemplate);
  readonly offTemplate = contentChild(TxRatingOffIconTemplate);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('rating', this, this.pt, this.ptOptions);

  readonly preview = signal<number | null>(null);
  readonly indexes = computed(() => Array.from({ length: Math.max(1, this.stars()) }, (_, index) => index));
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly shown = computed(() => this.preview() ?? this.value() ?? 0);
  readonly unit = computed(() => (this.allowHalf() ? 0.5 : 1));
  readonly onIconName = computed(() => (this.txIconRegistry.has(this.onIcon()) ? this.onIcon() : null));
  readonly offIconName = computed(() => (this.txIconRegistry.has(this.offIcon()) ? this.offIcon() : null));
  readonly valueText = computed(() =>
    this.translations()
      .ratingValue.replace('{value}', this.localeService.formatNumber(this.value() ?? 0))
      .replace('{stars}', String(this.stars())),
  );
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-rating'), ...this.passThrough().root?.style }));

  fill(index: number): number {
    return Math.max(0, Math.min(1, this.shown() - index)) * 100;
  }

  onPointerMove(event: PointerEvent): void {
    const star = this.starAt(event);
    if (this.isEditable() && star) {
      this.preview.set(this.valueAt(event, star));
    }
  }

  onPointerLeave(): void {
    this.preview.set(null);
  }

  onClick(event: MouseEvent): void {
    const star = this.starAt(event);
    if (this.isEditable() && star) {
      this.commit(this.valueAt(event, star), event);
      this.preview.set(null);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isEditable()) {
      return;
    }
    const current = this.value() ?? 0;
    const step = this.unit();
    const keys: Record<string, number | null> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      Home: step,
      End: this.stars(),
      PageUp: current + 1,
      PageDown: current - 1,
      Delete: null,
      Backspace: null,
      0: null,
    };
    if (/^[1-9]$/.test(event.key) && Number(event.key) <= this.stars()) {
      event.preventDefault();
      this.commit(Number(event.key), event);
      return;
    }
    if (!(event.key in keys)) {
      return;
    }
    event.preventDefault();
    const next = keys[event.key];
    this.commit(next === null || next <= 0 ? null : Math.min(this.stars(), next), event);
  }

  onBlur(): void {
    this.markTouched();
  }

  clear(event: Event): void {
    this.commit(null, event);
    this.cleared.emit();
  }

  private starAt(event: Event): HTMLElement | null {
    return (event.target as HTMLElement).closest<HTMLElement>('.tx-rating__star');
  }

  private valueAt(event: MouseEvent, star: HTMLElement): number {
    const index = Number(star.dataset['index']);
    if (!this.allowHalf()) {
      return index + 1;
    }
    const rect = star.getBoundingClientRect();
    const half = rect.width > 0 && event.clientX - rect.left < rect.width / 2;
    return index + (half ? 0.5 : 1);
  }

  private commit(value: number | null, event: Event): void {
    if (value !== this.value()) {
      this.updateValue(value);
      this.rated.emit({ value, originalEvent: event });
    }
  }
}
