/** Plural form of a translation key: `one`, `few` or `many`. */
export type TxPluralForm = 'one' | 'few' | 'many';

/** Plural category of the locale (`zero`, `one`, `two`, `few`, `many`, `other`). */
export type TxPluralCategory = Intl.LDMLPluralRule;

/** Texts by plural category, with `=0`, `=1` … for an exact number. */
export type TxPluralForms = Partial<Record<TxPluralCategory | `=${number}`, string>>;
