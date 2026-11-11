export type { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';

export type TxCodeEditorPart = 'root' | 'editor' | 'gutter' | 'content' | 'search' | 'searchInput';

export type TxCodeDiffView = 'inline' | 'split';

export type TxCodeDiffPart = 'root' | 'original' | 'modified' | 'gutter' | 'content';

export interface TxCodeDiffSummary {
  readonly added: number;
  readonly removed: number;
  readonly changes: number;
}
