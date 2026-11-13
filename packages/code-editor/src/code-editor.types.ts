export type { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';

/** Parts of `tx-code-editor` that `pt` can style. */
export type TxCodeEditorPart = 'root' | 'editor' | 'gutter' | 'content' | 'search' | 'searchInput';

/** Layout of a diff: `inline` stacks removed and added lines, `split` shows both versions side by side. */
export type TxCodeDiffView = 'inline' | 'split';

/** Parts of `tx-code-diff` that `pt` can style. */
export type TxCodeDiffPart = 'root' | 'original' | 'modified' | 'gutter' | 'content';

/** Totals of a diff: lines added, lines removed and number of changed blocks. */
export interface TxCodeDiffSummary {
  /** Number of lines added in the modified text. */
  readonly added: number;
  /** Number of lines removed from the original text. */
  readonly removed: number;
  /** Number of changed blocks. */
  readonly changes: number;
}
