import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { injectDescribedBy, uniqueId } from '@tectra/core/a11y';
import {
  TECTRA_CONFIG,
  TxPassThrough,
  TxPassThroughOptions,
  TxTranslations,
  TxValidationMessages,
  injectPassThrough,
  injectUnstyled,
} from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { TectraDeepPartial, TectraFieldMessageTokens, toStyleObject } from '@tectra/themes';
import { TxFieldMessagePart } from './message.types';

const BUILT_IN_MESSAGES: Record<string, keyof TxTranslations> = {
  required: 'validationRequired',
  email: 'validationEmail',
  minlength: 'validationMinlength',
  maxlength: 'validationMaxlength',
  min: 'validationMin',
  max: 'validationMax',
  pattern: 'validationPattern',
};

@Component({
  selector: 'tx-field-error',
  imports: [TxIcon],
  templateUrl: './field-error.component.html',
  styleUrl: './field-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-field-message tx-field-error',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[id]': 'resolvedId()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-state]': 'state()',
    'aria-live': 'polite',
  },
})
export class TxFieldError {
  private generatedId = uniqueId('tx-field-error');
  private globalMessages = inject(TECTRA_CONFIG, { optional: true })?.validationMessages;
  private translations = injectTranslations();
  private readonly version = signal(0);

  readonly control = input<AbstractControl | undefined>(undefined);
  readonly errorText = input<string | undefined>(undefined);
  readonly showImmediately = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly successText = input<string | undefined>(undefined);
  readonly messages = input<TxValidationMessages | undefined>(undefined);
  readonly for = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraFieldMessageTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFieldMessagePart, TxFieldError> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('fieldError', this, this.pt, this.ptOptions);
  readonly resolvedId = computed(() => this.id() ?? this.generatedId);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-field-message'), ...this.passThrough().root?.style }));

  readonly errorKey = computed(() => {
    this.version();
    return Object.keys(this.control()?.errors ?? {})[0] ?? null;
  });
  readonly shownError = computed(() => {
    this.version();
    const external = this.errorText();
    if (external) {
      return external;
    }
    const control = this.control();
    const key = this.errorKey();
    if (!control || !key || !(this.showImmediately() || control.touched || control.dirty)) {
      return null;
    }
    return this.describe(key, control.errors?.[key]);
  });
  readonly successShown = computed(() => {
    this.version();
    const control = this.control();
    return (
      !!control &&
      !!this.successText() &&
      !this.shownError() &&
      control.valid &&
      hasValue(control.value) &&
      (control.touched || control.dirty)
    );
  });
  readonly state = computed(() => (this.shownError() ? 'error' : this.successShown() ? 'success' : null));

  constructor() {
    injectDescribedBy(this.for, this.resolvedId);
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() => this.version.update((value) => value + 1));
      onCleanup(() => subscription?.unsubscribe());
    });
  }

  private describe(key: string, error: unknown): string {
    const custom = this.messages()?.[key] ?? this.globalMessages?.[key];
    if (custom) {
      return interpolate(typeof custom === 'function' ? custom(error) : custom, error);
    }
    if (isObject(error) && typeof error['message'] === 'string') {
      return error['message'];
    }
    return interpolate(this.translations()[BUILT_IN_MESSAGES[key] ?? 'validationInvalid'], error);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function interpolate(template: string, error: unknown): string {
  const params = isObject(error) ? error : {};
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (params[name] === undefined ? match : String(params[name])));
}

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined && String(value).trim() !== '';
}
