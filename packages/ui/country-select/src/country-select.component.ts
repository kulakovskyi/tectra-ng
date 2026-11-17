import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, forwardRef, inject, input, output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSelectTokens } from '@tectra-ng/themes';
import { TX_COUNTRY_CODES, TX_REGION_CODES, TxCountry, TxFlagShape, countryName, isCountryCode } from '@tectra-ng/ui/country';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxFieldVariant, TxSelect, TxSelectItem, TxSelectOptionTemplate, TxSelectSize, TxSelectValueTemplate } from '@tectra-ng/ui/select';
import { TxCountryItem, TxCountryOption, TxCountrySort } from './country-select.types';
import { injectTokens } from '@tectra-ng/core/config';
import { COUNTRY_SELECT_THEME } from './country-select.theme';

const FLAG_CODES = new Set([...TX_COUNTRY_CODES, ...TX_REGION_CODES]);

@Component({
  selector: 'tx-country-select',
  imports: [FormsModule, NgTemplateOutlet, TxSelect, TxMultiselect, TxSelectOptionTemplate, TxSelectValueTemplate, TxCountry],
  templateUrl: './country-select.component.html',
  styleUrl: './country-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxCountrySelect), multi: true }],
  host: {
    class: 'tx-country-select',
    '[attr.data-styled]': 'unstyled() ? null : true',
  },
})
export class TxCountrySelect extends TxFormControlBase<string | string[]> {
  private readonly countrySelectTheme = injectTokens(COUNTRY_SELECT_THEME);

  private locale = inject(TxLocaleService);

  readonly options = input<readonly (string | TxCountryOption)[] | undefined>(undefined);
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filter = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly sort = input<TxCountrySort>('name');
  readonly shape = input<TxFlagShape>('rectangle');
  readonly maxFlags = input<number>(3);
  readonly maxNamed = input<number>(1);
  readonly virtualScrollThreshold = input<number>(50);
  readonly placeholder = input<string>('');
  readonly showClear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inputId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly size = input<TxSelectSize>('medium');
  readonly variant = input<TxFieldVariant>('outlined');
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly readonly = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraSelectTokens> | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly changed = output<string | string[] | null>();

  readonly isInvalid = injectFieldInvalid(this.invalid);

  readonly items = computed<TxCountryItem[]>(() => {
    const locale = this.locale.locale().intl;
    const items = (this.options() ?? TX_COUNTRY_CODES).map((option) => {
      const entry: TxCountryOption = typeof option === 'string' ? { code: option } : option;
      const trimmed = entry.code.trim();
      const code = isCountryCode(trimmed) ? trimmed.toUpperCase() : trimmed;
      return {
        code,
        value: entry.value ?? code,
        label: entry.label ?? countryName(code, locale),
        flag: entry.flag ?? FLAG_CODES.has(code),
        count: entry.count ?? null,
        hint: entry.hint ?? '',
        disabled: !!entry.disabled,
      };
    });
    if (this.sort() === 'name') {
      const collator = new Intl.Collator(locale);
      items.sort((a, b) => collator.compare(a.label, b.label));
    }
    return items;
  });
  readonly virtual = computed(() => this.items().length > this.virtualScrollThreshold());

  extraCount(items: TxSelectItem[]): number {
    return Math.max(0, items.length - this.maxFlags());
  }

  firstFlags(items: TxSelectItem[]): TxCountryItem[] {
    return items.slice(0, this.maxFlags()).map((item) => item.option as TxCountryItem);
  }

  showsNames(items: TxSelectItem[]): boolean {
    return items.length <= this.maxNamed();
  }

  onModelChange(value: string | string[] | null): void {
    this.updateValue(value);
    this.changed.emit(value);
  }

  onClosed(): void {
    this.markTouched();
  }
}
