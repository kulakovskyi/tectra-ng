import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { plural, pluralForm } from './plural.functions';
import { TxPluralForm, TxPluralForms } from './plural.types';

@Pipe({ name: 'txPluralForm', pure: false })
export class TxPluralFormPipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);

  transform(count: number | null | undefined, locale?: string): TxPluralForm {
    return pluralForm(count ?? 0, locale ?? this.localeService.locale().intl);
  }
}

@Pipe({ name: 'txPlural', pure: false })
export class TxPluralPipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);

  transform(count: number | null | undefined, forms: string | TxPluralForms, locale?: string): string {
    return plural(count ?? 0, forms, locale ?? this.localeService.locale().intl);
  }
}
