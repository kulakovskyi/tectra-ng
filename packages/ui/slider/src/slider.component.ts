import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, forwardRef, inject, input, numberAttribute, output, signal, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSliderTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSliderChangeEvent, TxSliderMark, TxSliderOrientation, TxSliderPart, TxSliderValue } from './slider.types';

const MAX_STEP_MARKS = 100;

@Component({
  selector: 'tx-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxSlider), multi: true }],
  host: {
    class: 'tx-slider',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-orientation]': 'orientation()',
    '[class.tx-slider--range]': 'range()',
    '[class.tx-slider--dragging]': 'active() !== null',
    '[class.tx-slider--animate]': 'animate() && active() === null',
    '[class.tx-slider--disabled]': 'isDisabled()',
    '[class.tx-slider--readonly]': 'readonly()',
    '[class.tx-slider--invalid]': 'isInvalid()',
    '[class.tx-slider--labelled]': 'hasLabels()',
  },
})
export class TxSlider extends TxFormControlBase<TxSliderValue> {
  private localeService = inject(TxLocaleService);

  readonly min = input<number, unknown>(0, { transform: numberAttribute });
  readonly max = input<number, unknown>(100, { transform: numberAttribute });
  readonly step = input<number, unknown>(1, { transform: numberAttribute });
  readonly range = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<TxSliderOrientation>('horizontal');
  readonly minStepsBetweenHandles = input<number, unknown>(0, { transform: numberAttribute });
  readonly showSteps = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly marks = input<TxSliderMark[]>([]);
  readonly animate = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly valueTemplate = input<string>('{value}');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraSliderTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSliderPart, TxSlider> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxSliderChangeEvent>();
  readonly slideEnd = output<TxSliderChangeEvent>();

  readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('slider', this, this.pt, this.ptOptions);

  readonly active = signal<0 | 1 | null>(null);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly values = computed<[number, number]>(() => {
    const value = this.value();
    if (this.range()) {
      const [start, end] = Array.isArray(value) ? value : [this.min(), this.max()];
      return [this.clamp(start), this.clamp(end)];
    }
    return [this.min(), this.clamp(typeof value === 'number' ? value : this.min())];
  });
  readonly handles = computed<(0 | 1)[]>(() => (this.range() ? [0, 1] : [1]));
  readonly percents = computed(() => this.values().map((value) => this.percentOf(value)) as [number, number]);
  readonly rangeStart = computed(() => (this.range() ? this.percents()[0] : 0));
  readonly rangeSize = computed(() => this.percents()[1] - this.rangeStart());
  readonly gap = computed(() => this.minStepsBetweenHandles() * this.step());
  readonly stepMarks = computed(() => {
    if (!this.showSteps()) {
      return [];
    }
    const count = Math.floor((this.max() - this.min()) / this.step());
    return count > 0 && count <= MAX_STEP_MARKS ? Array.from({ length: count + 1 }, (_, index) => this.min() + index * this.step()) : [];
  });
  readonly allMarks = computed(() => {
    const labelled = this.marks();
    const unlabelled = this.stepMarks().filter((value) => !labelled.some((mark) => mark.value === value)).map((value) => ({ value }) as TxSliderMark);
    return [...unlabelled, ...labelled].map((mark) => ({ ...mark, percent: this.percentOf(mark.value), active: this.inRange(mark.value) }));
  });
  readonly hasLabels = computed(() => this.marks().some((mark) => !!mark.label));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-slider'), ...this.passThrough().root?.style }));

  handleLabel(handle: 0 | 1): string | null {
    const label = this.ariaLabel();
    if (!label || !this.range()) {
      return label ?? null;
    }
    return `${label}, ${handle === 0 ? this.translations().rangeStart : this.translations().rangeEnd}`;
  }

  valueText(handle: 0 | 1): string {
    return this.valueTemplate().replace('{value}', this.localeService.formatNumber(this.values()[handle]));
  }

  handleMin(handle: 0 | 1): number {
    return handle === 1 && this.range() ? this.values()[0] + this.gap() : this.min();
  }

  handleMax(handle: 0 | 1): number {
    return handle === 0 ? this.values()[1] - this.gap() : this.max();
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.isEditable() || event.button !== 0) {
      return;
    }
    event.preventDefault();
    const value = this.valueAt(event);
    const target = (event.target as HTMLElement).closest<HTMLElement>('.tx-slider__handle');
    const handle: 0 | 1 = target ? (Number(target.dataset['handle']) as 0 | 1) : this.nearest(value);
    this.active.set(handle);
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    this.focusHandle(handle);
    if (!target) {
      this.set(handle, value, event);
    }
  }

  onPointerMove(event: PointerEvent): void {
    const handle = this.active();
    if (handle !== null) {
      this.set(handle, this.valueAt(event), event);
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (this.active() !== null) {
      this.active.set(null);
      this.markTouched();
      this.slideEnd.emit({ value: this.currentValue(), originalEvent: event });
    }
  }

  onKeydown(event: KeyboardEvent, handle: 0 | 1): void {
    if (!this.isEditable()) {
      return;
    }
    const value = this.values()[handle];
    const step = this.step();
    const moves: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + step * 10,
      PageDown: value - step * 10,
      Home: this.handleMin(handle),
      End: this.handleMax(handle),
    };
    if (event.key in moves) {
      event.preventDefault();
      this.set(handle, moves[event.key], event);
      this.slideEnd.emit({ value: this.currentValue(), originalEvent: event });
    }
  }

  onBlur(): void {
    this.markTouched();
  }

  private set(handle: 0 | 1, raw: number, event: Event): void {
    const step = this.step();
    const snapped = Number((Math.round((raw - this.min()) / step) * step + this.min()).toFixed(decimals(step)));
    const next = Math.min(this.handleMax(handle), Math.max(this.handleMin(handle), this.clamp(snapped)));
    const values: [number, number] = [...this.values()];
    if (values[handle] === next) {
      return;
    }
    values[handle] = next;
    const value: TxSliderValue = this.range() ? values : values[1];
    this.updateValue(value);
    this.changed.emit({ value, originalEvent: event });
  }

  private currentValue(): TxSliderValue {
    return this.range() ? [...this.values()] : this.values()[1];
  }

  private valueAt(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const vertical = this.orientation() === 'vertical';
    const size = vertical ? rect.height : rect.width;
    if (!size) {
      return this.min();
    }
    const offset = vertical ? rect.bottom - event.clientY : event.clientX - rect.left;
    const fraction = Math.min(1, Math.max(0, offset / size));
    return this.min() + fraction * (this.max() - this.min());
  }

  private nearest(value: number): 0 | 1 {
    if (!this.range()) {
      return 1;
    }
    const [start, end] = this.values();
    if (start === end) {
      return value < start ? 0 : 1;
    }
    return Math.abs(value - start) <= Math.abs(value - end) ? 0 : 1;
  }

  private focusHandle(handle: 0 | 1): void {
    this.track().nativeElement.querySelector<HTMLElement>(`[data-handle="${handle}"]`)?.focus();
  }

  private inRange(value: number): boolean {
    const [start, end] = this.values();
    return value >= (this.range() ? start : this.min()) && value <= end;
  }

  private clamp(value: number): number {
    return Math.min(this.max(), Math.max(this.min(), value));
  }

  private percentOf(value: number): number {
    const span = this.max() - this.min();
    return span > 0 ? ((this.clamp(value) - this.min()) / span) * 100 : 0;
  }
}

function decimals(value: number): number {
  const text = String(value);
  return text.includes('.') ? text.split('.')[1].length : 0;
}
