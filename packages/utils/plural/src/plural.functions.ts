import { formatMessage } from '@tectra-ng/core/i18n';
import { TxPluralCategory, TxPluralForm, TxPluralForms } from './plural.types';

const rulesCache = new Map<string, Intl.PluralRules>();

function rules(locale: string): Intl.PluralRules {
  let found = rulesCache.get(locale);
  if (!found) {
    found = new Intl.PluralRules(locale);
    rulesCache.set(locale, found);
  }
  return found;
}

export function pluralCategory(count: number, locale = 'en-US'): TxPluralCategory {
  return rules(locale).select(count);
}

export function pluralForm(count: number, locale = 'en-US'): TxPluralForm {
  const category = pluralCategory(count, locale);
  return category === 'one' || category === 'few' ? category : 'many';
}

export function plural(count: number, forms: string | TxPluralForms, locale = 'en-US'): string {
  if (typeof forms === 'string') {
    return formatMessage(forms, { count }, locale);
  }
  const text = forms[`=${count}`] ?? forms[pluralCategory(count, locale)] ?? forms.other ?? forms.many ?? '';
  return text.replace(/#/g, String(count));
}
