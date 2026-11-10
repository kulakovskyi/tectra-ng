import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, TxTranslations, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraListInputTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_LIST_INPUT_LINES, TX_LIST_INPUT_PARSERS, TX_LIST_INPUT_WORDS, txParseList } from './list-input.parsers';
import { TxListInputParser, TxListInputPart, TxListInputResult, TxListInputType } from './list-input.types';

const LINE_BREAK = '\n';

const TEXTS: Record<TxListInputType, { placeholder: keyof TxTranslations; hint: keyof TxTranslations; count: keyof TxTranslations; icon: TxIconName }> = {
  domain: { placeholder: 'listInputPlaceholderDomain', hint: 'listInputHintDomain', count: 'listInputDomains', icon: 'globe' },
  email: { placeholder: 'listInputPlaceholderEmail', hint: 'listInputHintEmail', count: 'listInputEmails', icon: 'envelope' },
  url: { placeholder: 'listInputPlaceholderUrl', hint: 'listInputHintUrl', count: 'listInputUrls', icon: 'link' },
  text: { placeholder: 'listInputPlaceholder', hint: 'listInputHint', count: 'listInputItems', icon: 'list' },
};

@Component({
  selector: 'tx-list-input',
  imports: [TxButton, TxPill, TxTooltip],
  templateUrl: './list-input.component.html',
  styleUrl: './list-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxListInput), multi: true }],
  host: {
    class: 'tx-list-input',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-type]': 'type()',
    '[class.tx-list-input--disabled]': 'isDisabled()',
    '[attr.role]': 'isDisabled() ? "group" : null',
    '[attr.aria-disabled]': 'isDisabled() || null',
    '[class.tx-list-input--readonly]': 'readonly()',
    '[class.tx-list-input--invalid]': 'isInvalid()',
    '[class.tx-list-input--filled]': '!!text()',
  },
})
export class TxListInput extends TxFormControlBase<string[]> {
  private locale = inject(TxLocaleService);

  readonly text = model<string>('');
  readonly type = input<TxListInputType>('text');
  readonly parser = input<TxListInputParser | undefined>(undefined);
  readonly splitByLines = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly separator = input<RegExp | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
  readonly countLabel = input<string | undefined>(undefined);
  readonly rows = input<number, unknown>(8, { transform: numberAttribute });
  readonly invalidLimit = input<number, unknown>(8, { transform: numberAttribute });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input<boolean, unknown>(false, { alias: 'disabled', transform: booleanAttribute });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraListInputTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxListInputPart, TxListInput> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemsChange = output<string[]>();
  readonly parsedChange = output<TxListInputResult>();

  readonly field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  readonly statusId = uniqueId('tx-list-input-status');
  readonly translations = this.locale.translations;
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('listInput', this, this.pt, this.ptOptions);
  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly texts = computed(() => TEXTS[this.type()]);
  readonly parsed = computed(() =>
    txParseList(this.text(), this.parser() ?? TX_LIST_INPUT_PARSERS[this.type()], this.separator() ?? (this.splitByLines() ? TX_LIST_INPUT_LINES : TX_LIST_INPUT_WORDS)),
  );
  readonly invalidPreview = computed(() => this.parsed().invalid.slice(0, Math.max(0, this.invalidLimit())));
  readonly invalidHidden = computed(() => this.parsed().invalid.length - this.invalidPreview().length);
  readonly isEmpty = computed(() => !this.parsed().items.length && !this.parsed().invalid.length);
  readonly canCleanUp = computed(() => !!this.parsed().items.length && this.text().trim() !== this.parsed().items.join(LINE_BREAK));
  readonly placeholderText = computed(() => this.placeholder() ?? this.translations()[this.texts().placeholder]);
  readonly hintText = computed(() => this.hint() ?? this.translations()[this.texts().hint]);
  readonly countText = computed(() => {
    const count = this.parsed().items.length;
    const custom = this.countLabel();
    return custom !== undefined ? this.locale.format(custom, { count }) : this.locale.translate(this.texts().count, { count });
  });
  readonly duplicatesText = computed(() => this.locale.translate('listInputDuplicates', { count: this.parsed().duplicates }));
  readonly invalidCountText = computed(() => this.locale.translate('listInputInvalidCount', { count: this.parsed().invalid.length }));
  readonly moreText = computed(() => this.locale.translate('listInputMore', { count: this.invalidHidden() }));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-list-input'), ...this.passThrough().root?.style }));

  override writeValue(value: string[] | null): void {
    const items = Array.isArray(value) ? value : [];
    super.writeValue(items);
    if (!sameItems(items, this.parsed().items)) {
      this.text.set(items.join(LINE_BREAK));
    }
  }

  onInput(event: Event): void {
    this.setText((event.target as HTMLTextAreaElement).value);
  }

  onBlur(): void {
    this.markTouched();
  }

  cleanUp(): void {
    this.setText(this.parsed().items.join(LINE_BREAK));
    this.field().nativeElement.focus();
  }

  clear(): void {
    this.setText('');
    this.field().nativeElement.focus();
  }

  private setText(text: string): void {
    this.text.set(text);
    const parsed = this.parsed();
    this.updateValue(parsed.items);
    this.itemsChange.emit(parsed.items);
    this.parsedChange.emit(parsed);
  }
}

function sameItems(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}
