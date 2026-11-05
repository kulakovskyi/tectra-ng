export type TxKeyFilterPreset =
  | 'pint'
  | 'int'
  | 'pnum'
  | 'num'
  | 'money'
  | 'hex'
  | 'email'
  | 'alpha'
  | 'alphanum'
  | 'latin'
  | 'positive'
  | 'nospace';

export interface TxKeyFilterRule {
  char: RegExp;
  value?: RegExp;
}
