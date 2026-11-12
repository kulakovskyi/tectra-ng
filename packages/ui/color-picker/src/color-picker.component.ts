import { CdkConnectedOverlay, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TX_FIELD_STATE, TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxOverlayInsets, TxPlacement, placementFromPosition, txAnimateEnter, txAnimateLeave, txPositions, watchOrigin, TxOverlayAnchor, txScrollStrategy } from '@tectra-ng/core/overlay';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraColorPickerTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxInput } from '@tectra-ng/ui/input';
import { hsbToRgb, parseHex, rgbToHex, rgbToHsb, toHsb } from './color';
import { txColorHexValidator } from './color-validator';
import { TxColorFormat, TxColorPickerPart, TxColorPickerSize, TxColorValue, TxHsb } from './color-picker.types';
import { COLOR_PICKER_ICON_DEFAULTS } from './color-picker.icons';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

@Component({
  selector: 'tx-color-picker',
  imports: [CdkConnectedOverlay, TxOverlayAnchor, NgTemplateOutlet, TxIcon, TxInput],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxColorPicker), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => TxColorPicker), multi: true },
  ],
  host: {
    class: 'tx-color-picker',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-color-picker--inline]': 'inline()',
    '[class.tx-color-picker--field]': 'field() && !inline()',
    '[class.tx-color-picker--open]': 'isOpen()',
    '[class.tx-color-picker--disabled]': 'disabled()',
    '[class.tx-color-picker--invalid]': 'isInvalid()',
    '[class.tx-color-picker--readonly]': 'readonly()',
    '[class.tx-color-picker--filled]': 'hasColor()',
  },
  viewProviders: [provideTxIconDefaults(COLOR_PICKER_ICON_DEFAULTS)],
})
export class TxColorPicker extends TxFormControlBase<TxColorValue> implements Validator {
  readonly format = input<TxColorFormat>('hex');
  readonly inline = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly field = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly presets = input<readonly string[]>([]);
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showInput = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showValue = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly placeholder = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<TxColorPickerSize>('medium');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraColorPickerTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxColorPickerPart, TxColorPicker> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<TxColorValue | null>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  readonly area = viewChild<ElementRef<HTMLElement>>('area');
  readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  private injector = inject(Injector);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly hostElement = this.host.nativeElement;
  private inField = !!inject(TX_FIELD_STATE, { optional: true });
  private overlayInsets = inject(TxOverlayInsets);
  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  private readonly followOrigin = effect((onCleanup) => {
    if (!this.isOpen()) {
      return;
    }
    onCleanup(
      watchOrigin(this.host.nativeElement, this.overlayInsets, {
        insetsChange: () => this.connectedOverlay()?.overlayRef?.updatePosition(),
        containerScroll: () => this.close(false),
      }),
    );
  });
  readonly translations = injectTranslations();
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('colorPicker', this, this.pt, this.ptOptions);
  readonly positions = txPositions('bottom-start', 4);
  readonly scrollStrategy = txScrollStrategy(this.injector);
  readonly panelId = uniqueId('tx-color-picker');
  readonly valueId = `${this.panelId}-value`;

  readonly hsb = signal<TxHsb>({ h: 0, s: 100, b: 100 });
  readonly hasColor = signal(false);
  readonly isOpen = signal(false);
  readonly isPanelMounted = signal(false);
  readonly placement = signal<TxPlacement>('bottom-start');
  readonly draft = signal<string | null>(null);
  readonly fieldText = signal('');
  private readonly exact = signal<string | null>(null);
  private hasEntered = false;

  readonly hex = computed(() => this.exact() ?? rgbToHex(hsbToRgb(this.hsb())));
  readonly hueColor = computed(() => rgbToHex(hsbToRgb({ h: this.hsb().h, s: 100, b: 100 })));
  readonly areaText = computed(() =>
    this.translations()
      .colorAreaValue.replace('{saturation}', String(this.hsb().s))
      .replace('{brightness}', String(this.hsb().b)),
  );
  readonly triggerText = computed(() => (this.hasColor() ? this.hex() : (this.placeholder() ?? this.translations().noColor)));
  readonly triggerLabel = computed(() => {
    if (this.ariaLabelledBy() || (this.inputId() && !this.ariaLabel())) {
      return null;
    }
    const name = this.ariaLabel() ?? this.translations().pickColor;
    return this.showValue() ? `${name}, ${this.triggerText()}` : name;
  });
  readonly fieldLabel = computed(() => this.ariaLabel() ?? (this.inputId() || this.ariaLabelledBy() || this.inField ? null : this.translations().colorHex));
  readonly editable = computed(() => !this.disabled() && !this.readonly());
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-color-picker'), ...this.passThrough().root?.style }));
  readonly panelStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-color-picker'), ...this.passThrough().panel?.style }));

  override writeValue(value: TxColorValue | null): void {
    super.writeValue(value);
    const hsb = toHsb(value);
    const rgb = typeof value === 'string' ? parseHex(value) : null;
    this.exact.set(rgb ? rgbToHex(rgb) : null);
    this.hasColor.set(!!hsb);
    if (hsb) {
      this.hsb.set(hsb);
    }
    this.draft.set(null);
    this.fieldText.set(typeof value === 'string' ? value : hsb ? this.hex() : '');
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.field() ? txColorHexValidator()(control) : null;
  }

  onFieldInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.fieldText.set(text);
    const rgb = parseHex(text);
    this.exact.set(rgb ? rgbToHex(rgb) : null);
    this.hasColor.set(!!rgb);
    if (rgb) {
      this.hsb.set(rgbToHsb(rgb));
    }
    const value = rgb && this.format() !== 'hex' ? this.toValue(this.hsb()) : text.trim() ? text : null;
    this.updateValue(value);
    this.changed.emit(value);
  }

  onFieldBlur(): void {
    const text = this.fieldText();
    const rgb = parseHex(text);
    const normalized = rgb ? rgbToHex(rgb) : text.trim() ? text : '';
    if (normalized !== text) {
      this.fieldText.set(normalized);
      const value = rgb ? this.toValue(this.hsb()) : null;
      this.updateValue(value);
      this.changed.emit(value);
    }
    if (!this.isOpen()) {
      this.markTouched();
    }
  }

  open(): void {
    if (this.inline() || this.isOpen() || !this.editable()) {
      return;
    }
    this.isOpen.set(true);
    this.hasEntered = false;
    this.isPanelMounted.set(true);
    this.opened.emit();
  }

  close(focusTrigger = true): void {
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.markTouched();
    this.closed.emit();
    if (focusTrigger) {
      this.trigger()?.nativeElement.focus();
    }
    const panel = this.panel()?.nativeElement;
    (panel ? txAnimateLeave(panel, this.placement()) : Promise.resolve()).then(() => {
      if (!this.isOpen()) {
        this.isPanelMounted.set(false);
      }
    });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  onAttach(): void {
    queueMicrotask(() => this.area()?.nativeElement.focus());
  }

  onPositionChange(change: ConnectedOverlayPositionChange): void {
    this.placement.set(placementFromPosition(change.connectionPair) ?? 'bottom-start');
    const panel = this.panel()?.nativeElement;
    if (!this.hasEntered && panel) {
      this.hasEntered = true;
      txAnimateEnter(panel, this.placement());
    }
  }

  onOutsideClick(event: MouseEvent): void {
    if (!this.trigger()?.nativeElement.contains(event.target as Node)) {
      this.close(false);
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
    }
  }

  onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (this.isOpen() && next && !this.panel()?.nativeElement.contains(next) && !this.trigger()?.nativeElement.contains(next)) {
      this.close(false);
    }
  }

  onAreaPointer(event: PointerEvent): void {
    if (!this.editable() || (event.type === 'pointermove' && !event.buttons)) {
      return;
    }
    const element = event.currentTarget as HTMLElement;
    if (event.type === 'pointerdown') {
      element.setPointerCapture?.(event.pointerId);
      element.focus({ preventScroll: true });
    }
    const rect = element.getBoundingClientRect();
    const s = Math.round(clamp((event.clientX - rect.left) / rect.width, 0, 1) * 100);
    const b = Math.round((1 - clamp((event.clientY - rect.top) / rect.height, 0, 1)) * 100);
    this.commit({ ...this.hsb(), s, b });
  }

  onHuePointer(event: PointerEvent): void {
    if (!this.editable() || (event.type === 'pointermove' && !event.buttons)) {
      return;
    }
    const element = event.currentTarget as HTMLElement;
    if (event.type === 'pointerdown') {
      element.setPointerCapture?.(event.pointerId);
      element.focus({ preventScroll: true });
    }
    const rect = element.getBoundingClientRect();
    this.commit({ ...this.hsb(), h: Math.round(clamp((event.clientX - rect.left) / rect.width, 0, 1) * 360) });
  }

  onAreaKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    const { s, b } = this.hsb();
    const next: Record<string, Partial<TxHsb>> = {
      ArrowRight: { s: s + step },
      ArrowLeft: { s: s - step },
      ArrowUp: { b: b + step },
      ArrowDown: { b: b - step },
      PageUp: { b: b + 10 },
      PageDown: { b: b - 10 },
      Home: { s: 0 },
      End: { s: 100 },
    };
    this.applyKey(event, next[event.key]);
  }

  onHueKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    const { h } = this.hsb();
    const next: Record<string, Partial<TxHsb>> = {
      ArrowRight: { h: h + step },
      ArrowUp: { h: h + step },
      ArrowLeft: { h: h - step },
      ArrowDown: { h: h - step },
      PageUp: { h: h + 10 },
      PageDown: { h: h - 10 },
      Home: { h: 0 },
      End: { h: 360 },
    };
    this.applyKey(event, next[event.key]);
  }

  onHexInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.draft.set(text);
    const rgb = parseHex(text);
    if (rgb) {
      this.commit(rgbToHsb(rgb), false, rgbToHex(rgb));
    }
  }

  onHexBlur(): void {
    this.draft.set(null);
  }

  pickPreset(color: string): void {
    const rgb = parseHex(color);
    if (rgb && this.editable()) {
      this.commit(rgbToHsb(rgb), true, rgbToHex(rgb));
    }
  }

  isPreset(color: string): boolean {
    const rgb = parseHex(color);
    return this.hasColor() && !!rgb && rgbToHex(rgb) === this.hex();
  }

  clear(): void {
    this.exact.set(null);
    this.hasColor.set(false);
    this.draft.set(null);
    this.fieldText.set('');
    this.updateValue(null);
    this.changed.emit(null);
  }

  private applyKey(event: KeyboardEvent, change: Partial<TxHsb> | undefined): void {
    if (!change || !this.editable()) {
      return;
    }
    event.preventDefault();
    const hsb = { ...this.hsb(), ...change };
    this.commit({ h: clamp(hsb.h, 0, 360), s: clamp(hsb.s, 0, 100), b: clamp(hsb.b, 0, 100) });
  }

  private commit(hsb: TxHsb, resetDraft = true, exact: string | null = null): void {
    this.exact.set(exact);
    this.hsb.set(hsb);
    this.hasColor.set(true);
    if (resetDraft) {
      this.draft.set(null);
    }
    const value = this.toValue(hsb);
    this.fieldText.set(this.hex());
    this.updateValue(value);
    this.changed.emit(value);
  }

  private toValue(hsb: TxHsb): TxColorValue {
    const exact = this.exact();
    switch (this.format()) {
      case 'rgb':
        return (exact ? parseHex(exact) : null) ?? hsbToRgb(hsb);
      case 'hsb':
        return { ...hsb };
      default:
        return exact ?? rgbToHex(hsbToRgb(hsb));
    }
  }
}
