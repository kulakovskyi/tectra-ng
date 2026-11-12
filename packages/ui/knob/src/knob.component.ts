import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChild, forwardRef, inject, input, numberAttribute, output, signal, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraKnobTokens, toStyleObject } from '@tectra-ng/themes';
import { TxKnobValueTemplate } from './knob-templates.directive';
import { TxKnobArc, TxKnobChangeEvent, TxKnobPart } from './knob.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { KNOB_ICON_DEFAULTS } from './knob.icons';
import { KNOB_THEME } from './knob.theme';

const CENTER = 50;

@Component({
  selector: 'tx-knob',
  imports: [NgTemplateOutlet],
  templateUrl: './knob.component.html',
  styleUrl: './knob.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxKnob), multi: true }],
  host: {
    class: 'tx-knob',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-arc]': 'arc()',
    '[class.tx-knob--dragging]': 'isDragging()',
    '[class.tx-knob--disabled]': 'isDisabled()',
    '[class.tx-knob--readonly]': 'readonly()',
    '[class.tx-knob--invalid]': 'isInvalid()',
  },
  viewProviders: [provideTxIconDefaults(KNOB_ICON_DEFAULTS)],
})
export class TxKnob extends TxFormControlBase<number> {
  private readonly knobTheme = injectTokens(KNOB_THEME);

  private localeService = inject(TxLocaleService);
  private lastFraction = 0;

  readonly min = input<number, unknown>(0, { transform: numberAttribute });
  readonly max = input<number, unknown>(100, { transform: numberAttribute });
  readonly step = input<number, unknown>(1, { transform: numberAttribute });
  readonly limit = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly size = input<number, unknown>(100, { transform: numberAttribute });
  readonly strokeWidth = input<number, unknown>(12, { transform: numberAttribute });
  readonly arc = input<TxKnobArc>('dial');
  readonly showValue = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showHandle = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly valueTemplate = input<string>('{value}');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraKnobTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxKnobPart, TxKnob> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxKnobChangeEvent>();

  readonly template = contentChild(TxKnobValueTemplate);
  readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('knob', this, this.pt, this.ptOptions);

  readonly isDragging = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly ceiling = computed(() => Math.min(this.max(), this.limit() ?? this.max()));
  readonly current = computed(() => this.clamp(this.value() ?? this.min()));
  readonly radius = computed(() => CENTER - this.strokeWidth() / 2 - (this.hasHandle() ? 3 : 0));
  readonly sweep = computed(() => (this.arc() === 'ring' ? 360 : 270));
  readonly start = computed(() => (this.arc() === 'ring' ? -90 : 135));
  readonly span = computed(() => (this.sweep() / 360) * 100);
  readonly hasHandle = computed(() => this.showHandle() ?? this.arc() === 'ring');
  readonly fraction = computed(() => this.fractionOf(this.current()));
  readonly limitFraction = computed(() => (this.limit() === undefined ? 1 : this.fractionOf(this.ceiling())));
  readonly rotate = computed(() => `rotate(${this.start()} ${CENTER} ${CENTER})`);
  readonly valueDash = computed(() => `${this.fraction() * this.span()} 100`);
  readonly rangeDash = computed(() => `${this.span()} 100`);
  readonly limitDash = computed(() => `0 ${this.limitFraction() * this.span()} ${(1 - this.limitFraction()) * this.span()} 100`);
  readonly handle = computed(() => this.point(this.fraction()));
  readonly text = computed(() => this.valueTemplate().replace('{value}', this.localeService.formatNumber(this.current())));
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-knob'),
    width: `${this.size()}px`,
    height: `${this.size()}px`,
    ...this.passThrough().root?.style,
  }));

  readonly center = CENTER;

  onPointerDown(event: PointerEvent): void {
    if (!this.isEditable() || event.button !== 0) {
      return;
    }
    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    (event.currentTarget as HTMLElement).focus();
    this.isDragging.set(true);
    this.lastFraction = this.fraction();
    this.moveTo(event, true);
  }

  onPointerMove(event: PointerEvent): void {
    if (this.isDragging()) {
      this.moveTo(event, false);
    }
  }

  onPointerUp(): void {
    if (this.isDragging()) {
      this.isDragging.set(false);
      this.markTouched();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isEditable()) {
      return;
    }
    const value = this.current();
    const step = this.step();
    const moves: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + step * 10,
      PageDown: value - step * 10,
      Home: this.min(),
      End: this.ceiling(),
    };
    if (event.key in moves) {
      event.preventDefault();
      this.commit(moves[event.key], event);
    }
  }

  onBlur(): void {
    this.markTouched();
  }

  private moveTo(event: PointerEvent, first: boolean): void {
    const rect = this.svg().nativeElement.getBoundingClientRect();
    if (!rect.width) {
      return;
    }
    const x = ((event.clientX - rect.left) / rect.width) * 100 - CENTER;
    const y = ((event.clientY - rect.top) / rect.height) * 100 - CENTER;
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    let relative = (angle - this.start() + 720) % 360;
    if (relative > this.sweep()) {
      relative = relative > this.sweep() + (360 - this.sweep()) / 2 ? 0 : this.sweep();
    }
    let fraction = relative / this.sweep();
    if (!first && this.arc() === 'ring' && Math.abs(fraction - this.lastFraction) > 0.5) {
      fraction = this.lastFraction > 0.5 ? 1 : 0;
    }
    this.lastFraction = fraction;
    this.commit(this.min() + fraction * (this.max() - this.min()), event);
  }

  private commit(raw: number, event: Event): void {
    const step = this.step();
    const snapped = Math.round((raw - this.min()) / step) * step + this.min();
    const value = Number(this.clamp(snapped).toFixed(decimals(step)));
    if (value !== this.value()) {
      this.updateValue(value);
      this.changed.emit({ value, originalEvent: event });
    }
  }

  private clamp(value: number): number {
    return Math.min(this.ceiling(), Math.max(this.min(), value));
  }

  private fractionOf(value: number): number {
    const range = this.max() - this.min();
    return range > 0 ? (value - this.min()) / range : 0;
  }

  private point(fraction: number): { x: number; y: number } {
    const angle = ((this.start() + fraction * this.sweep()) * Math.PI) / 180;
    return { x: CENTER + this.radius() * Math.cos(angle), y: CENTER + this.radius() * Math.sin(angle) };
  }
}

function decimals(value: number): number {
  const text = String(value);
  return text.includes('.') ? text.split('.')[1].length : 0;
}
