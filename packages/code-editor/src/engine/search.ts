import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

export interface TxCodeSearchQuery {
  readonly text: string;
  readonly matchCase: boolean;
  readonly wholeWord: boolean;
  readonly regexp: boolean;
}

export interface TxCodeSearchMatch {
  readonly from: number;
  readonly to: number;
}

export interface TxCodeSearchResult {
  readonly matches: readonly TxCodeSearchMatch[];
  readonly valid: boolean;
  readonly pattern: RegExp | null;
}

const MATCH_LIMIT = 10000;
const MATCH = Decoration.mark({ class: 'tx-code-editor__match' });
const CURRENT = Decoration.mark({ class: 'tx-code-editor__match tx-code-editor__match--current' });

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

export const setSearchMarks = StateEffect.define<{ matches: readonly TxCodeSearchMatch[]; current: number }>();

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
