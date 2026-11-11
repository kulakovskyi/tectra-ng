export type TxPluralForm = 'one' | 'few' | 'many';

export type TxPluralCategory = Intl.LDMLPluralRule;

export type TxPluralForms = Partial<Record<TxPluralCategory | `=${number}`, string>>;
