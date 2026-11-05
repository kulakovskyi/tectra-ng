export type TxHighlightTextPart = 'root' | 'mark';

export type TxHighlightTerms = string | readonly string[] | null | undefined;

export interface TxHighlightPart {
  text: string;
  match: boolean;
}

export interface TxHighlightOptions {
  caseSensitive?: boolean;
}
