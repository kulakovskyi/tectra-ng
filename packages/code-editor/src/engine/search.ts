import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

/** What the search panel of the code editor looks for. */
export interface TxCodeSearchQuery {
  /** The text or, with `regexp`, the pattern to find. */
  readonly text: string;
  /** Distinguishes upper and lower case. */
  readonly matchCase: boolean;
  /** Matches only whole words. */
  readonly wholeWord: boolean;
  /** Reads `text` as a regular expression. */
  readonly regexp: boolean;
}

/** One found occurrence in the document. */
export interface TxCodeSearchMatch {
  /** Offset of the first character of the match. */
  readonly from: number;
  /** Offset after the last character of the match. */
  readonly to: number;
}

/** Everything a search found in a text. */
export interface TxCodeSearchResult {
  /** All matches in document order (at most 10000). */
  readonly matches: readonly TxCodeSearchMatch[];
  /** `false` when the query is a regular expression that does not compile. */
  readonly valid: boolean;
  /** The compiled expression behind the search; `null` for an empty or invalid query. */
  readonly pattern: RegExp | null;
}

const MATCH_LIMIT = 10000;
const MATCH = Decoration.mark({ class: 'tx-code-editor__match' });
const CURRENT = Decoration.mark({ class: 'tx-code-editor__match tx-code-editor__match--current' });

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Builds the regular expression of a query; `null` when the text is empty or the expression is invalid. */
export function searchPattern(query: TxCodeSearchQuery): RegExp | null {
  if (!query.text) {
    return null;
  }
  let source = query.regexp ? query.text : escapeRegExp(query.text);
  if (query.wholeWord) {
    source = `(?<![\\w$])(?:${source})(?![\\w$])`;
  }
  try {
    return new RegExp(source, `g${query.matchCase ? '' : 'i'}m`);
  } catch {
    return null;
  }
}

/** Finds every non-empty match of a query in a text. */
export function findMatches(text: string, query: TxCodeSearchQuery): TxCodeSearchResult {
  if (!query.text) {
    return { matches: [], valid: true, pattern: null };
  }
  const pattern = searchPattern(query);
  if (!pattern) {
    return { matches: [], valid: false, pattern: null };
  }
  const matches: TxCodeSearchMatch[] = [];
  let found: RegExpExecArray | null;
  while ((found = pattern.exec(text)) && matches.length < MATCH_LIMIT) {
    if (found[0].length === 0) {
      pattern.lastIndex++;
      continue;
    }
    matches.push({ from: found.index, to: found.index + found[0].length });
  }
  return { matches, valid: true, pattern };
}

/**
 * Gives the text that replaces a match; with `regexp` the groups of the match fill `$1`, `$2` and so on in the replacement.
 */
export function replacementFor(state: EditorState, match: TxCodeSearchMatch, query: TxCodeSearchQuery, replacement: string): string {
  if (!query.regexp) {
    return replacement;
  }
  const pattern = searchPattern(query);
  if (!pattern) {
    return replacement;
  }
  const text = state.doc.sliceString(match.from, match.to);
  return text.replace(new RegExp(pattern.source, pattern.flags.replace('g', '')), replacement);
}

/**
 * Effect that sets the highlighted matches and which of them is the current one; used by `tx-code-editor`.
 */
export const setSearchMarks = StateEffect.define<{ matches: readonly TxCodeSearchMatch[]; current: number }>();

/** Editor state that draws the matches of the search panel and keeps them in place while the text changes. */
export const searchMarks = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, transaction) {
    let marks = value.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(setSearchMarks)) {
        const { matches, current } = effect.value;
        marks = Decoration.set(
          matches.map((match, index) => (index === current ? CURRENT : MATCH).range(match.from, match.to)),
          true,
        );
      }
    }
    return marks;
  },
  provide: (field) => EditorView.decorations.from(field),
});
