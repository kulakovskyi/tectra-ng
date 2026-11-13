/** Parts of `tx-highlight-text` that `pt` can style. */
export type TxHighlightTextPart = 'root' | 'mark';

/** Words to highlight: one string, a list of strings or nothing. */
export type TxHighlightTerms = string | readonly string[] | null | undefined;

/** A piece of text and whether it matched a term. */
export interface TxHighlightPart {
  /** The piece of the original text. */
  text: string;
  /** `true` when the piece matches a term and should be highlighted. */
  match: boolean;
}

/** Options of `highlightParts`. */
export interface TxHighlightOptions {
  /** Tells upper and lower case apart (default `false`). */
  caseSensitive?: boolean;
}
