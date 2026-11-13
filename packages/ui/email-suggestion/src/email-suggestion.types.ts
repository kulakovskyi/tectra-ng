/** Why an address is suggested: `complete` adds your own domain, `typo` fixes a mistyped common domain. */
export type TxEmailSuggestionKind = 'complete' | 'typo';
/** Names of the parts of `tx-email-suggestion` that `pt` can style. */
export type TxEmailSuggestionPart = 'root' | 'button';

/** A suggested address and why it is suggested. */
export interface TxEmailSuggestionResult {
  /** The suggested address. */
  email: string;
  /** Whether the address completes the domain or fixes a typo. */
  kind: TxEmailSuggestionKind;
}
