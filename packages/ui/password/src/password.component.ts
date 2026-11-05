import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectFluid } from '@tectra/core/fluid';
import { TxFormControlBase, injectFieldInvalid } from '@tectra/core/forms';
import { injectTranslations } from '@tectra/core/i18n';
import { TxOverlay, TxOverlayRef } from '@tectra/core/overlay';
import { optionalBoolean, optionalNumber } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { TectraDeepPartial, TectraPasswordTokens, toStyleObject } from '@tectra/themes';
import { TxInput } from '@tectra/ui/input';
import { TxPasswordContentTemplate, TxPasswordFooterTemplate, TxPasswordHeaderTemplate } from './password-templates.directive';
import { TxPasswordPart, TxPasswordSize, TxPasswordStrength, TxPasswordVariant } from './password.types';

const MEDIUM = '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})';
const STRONG = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';

@Component({
  selector: 'tx-password',
  imports: [TxInput, TxIcon, NgTemplateOutlet],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxPassword), multi: true }],
  host: {
    class: 'tx-password',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-password--fluid]': 'isFluid()',
    '[class.tx-password--filled]': 'hasValue()',
    '[class.tx-password--invalid]': 'isInvalid()',
    '[class.tx-password--disabled]': 'isDisabled()',
  },
})
export class TxPassword extends TxFormControlBase<string> {
  private overlay = inject(TxOverlay);
  private viewContainerRef = inject(ViewContainerRef);
  private generatedId = uniqueId('tx-password');
  private panelRef: TxOverlayRef | null = null;

  readonly feedback = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly toggleMask = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly placeholder = input<string | undefined>(undefined);
  readonly promptLabel = input<string | undefined>(undefined);
  readonly weakLabel = input<string | undefined>(undefined);
  readonly mediumLabel = input<string | undefined>(undefined);
  readonly strongLabel = input<string | undefined>(undefined);
  readonly mediumRegex = input<string | RegExp>(MEDIUM);
  readonly strongRegex = input<string | RegExp>(STRONG);
  readonly autocomplete = input<string>('current-password');
  readonly size = input<TxPasswordSize>('medium');
  readonly variant = input<TxPasswordVariant>('outlined');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly maxlength = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly name = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly tabindex = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraPasswordTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPasswordPart, TxPassword> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly strengthChange = output<TxPasswordStrength | null>();
  readonly cleared = output<void>();

  readonly headerTemplate = contentChild(TxPasswordHeaderTemplate);
  readonly contentTemplate = contentChild(TxPasswordContentTemplate);
  readonly footerTemplate = contentChild(TxPasswordFooterTemplate);
  readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isFluid = injectFluid(this.fluid);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('password', this, this.pt, this.ptOptions);

  readonly isMasked = signal(true);
  readonly isFocused = signal(false);
  readonly resolvedId = computed(() => this.inputId() ?? this.generatedId);
  readonly infoId = `${this.generatedId}-info`;
  readonly text = computed(() => this.value() ?? '');
  readonly hasValue = computed(() => this.text() !== '');
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly isEditable = computed(() => !this.isDisabled() && !this.readonly());
  readonly strength = computed<TxPasswordStrength | null>(() => {
    const value = this.text();
    if (!value) {
      return null;
    }
    if (toRegExp(this.strongRegex()).test(value)) {
      return 'strong';
    }
    return toRegExp(this.mediumRegex()).test(value) ? 'medium' : 'weak';
  });
  readonly info = computed(() => {
    const t = this.translations();
    switch (this.strength()) {
      case 'strong':
        return this.strongLabel() ?? t.passwordStrong;
      case 'medium':
        return this.mediumLabel() ?? t.passwordMedium;
      case 'weak':
        return this.weakLabel() ?? t.passwordWeak;
      default:
        return this.promptLabel() ?? t.passwordPrompt;
    }
  });
  readonly actionCount = computed(() => Number(this.toggleMask()) + Number(this.showClear() && this.hasValue() && this.isEditable()));
  readonly templateContext = computed(() => ({ $implicit: this.strength(), value: this.text() }));
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-password'),
    '--tx-password-actions': String(this.actionCount()),
    ...this.passThrough().root?.style,
  }));

  constructor() {
    super();
    let previous: TxPasswordStrength | null = null;
    effect(() => {
      const strength = this.strength();
      if (strength !== previous) {
        previous = strength;
        this.strengthChange.emit(strength);
      }
    });
    inject(DestroyRef).onDestroy(() => this.panelRef?.close());
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  onInput(event: Event): void {
    this.updateValue((event.target as HTMLInputElement).value);
  }

  onFocus(): void {
    this.isFocused.set(true);
    if (this.feedback() && this.isEditable() && !this.panelRef) {
      this.panelRef = this.overlay.open(this.panelTemplate(), {
        origin: this.inputRef().nativeElement,
        viewContainerRef: this.viewContainerRef,
        placement: 'bottom-start',
        matchWidth: true,
        closeOnOutsideClick: false,
        restoreFocus: false,
        panelClass: 'tx-password-overlay',
      });
      this.panelRef.closed.subscribe(() => (this.panelRef = null));
    }
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.markTouched();
    this.panelRef?.close();
  }

  fill(value: string, reveal = true): void {
    this.updateValue(value);
    if (reveal) {
      this.isMasked.set(false);
    }
  }

  toggleVisibility(): void {
    this.isMasked.update((masked) => !masked);
    this.focus();
  }

  clear(): void {
    this.updateValue('');
    this.cleared.emit();
    this.focus();
  }
}

function toRegExp(pattern: string | RegExp): RegExp {
  return typeof pattern === 'string' ? new RegExp(pattern) : pattern;
}
