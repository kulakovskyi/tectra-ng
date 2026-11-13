/** Ready-made character sets for `txKeyFilter`, such as digits, letters, hex or email characters. */
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

/** What a key filter allows: a pattern for each character and an optional pattern for the whole text. */
export interface TxKeyFilterRule {
  /** Each typed or pasted character must match this pattern. */
  char: RegExp;
  /** The whole text must match this pattern as well, when set. */
  value?: RegExp;
}
