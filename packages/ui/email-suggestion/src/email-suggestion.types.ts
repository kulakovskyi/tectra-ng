export type TxEmailSuggestionKind = 'complete' | 'typo';
export type TxEmailSuggestionPart = 'root' | 'button';

export interface TxEmailSuggestionResult {
  email: string;
  kind: TxEmailSuggestionKind;
}
