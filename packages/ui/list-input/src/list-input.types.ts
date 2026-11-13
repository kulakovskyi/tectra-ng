/** What `tx-list-input` accepts as an entry: domains, emails, URLs or any text. */
export type TxListInputType = 'domain' | 'email' | 'url' | 'text';
/** Cleans one entry and returns it, or `null` when the entry is not valid. */
export type TxListInputParser = (token: string) => string | null;
/** Parts of `tx-list-input` that `pt` can style. */
export type TxListInputPart = 'root' | 'field' | 'footer' | 'stats' | 'actions' | 'invalid';

/** Outcome of parsing a text into a list of entries. */
export interface TxListInputResult {
  /** Valid entries without duplicates, in order of appearance. */
  items: string[];
  /** Tokens the parser rejected. */
  invalid: string[];
  /** How many valid entries were skipped because they were already in the list. */
  duplicates: number;
}
