import { EditorState, Extension } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', ')': '(', ']': '[', '}': '{' };
const OPENING = new Set(['(', '[', '{']);
const SCAN_LIMIT = 20000;
const MARK = Decoration.mark({ class: 'tx-code-editor__bracket' });

export function matchBracket(state: EditorState, position: number): [number, number] | null {
  const doc = state.doc;
  const char = doc.sliceString(position, position + 1);
  const pair = PAIRS[char];
  if (!pair) {
    return null;
  }
  const forward = OPENING.has(char);
  const end = forward ? Math.min(doc.length, position + SCAN_LIMIT) : Math.max(0, position - SCAN_LIMIT);
  const text = forward ? doc.sliceString(position + 1, end) : doc.sliceString(end, position);
  let depth = 0;
  if (forward) {
    for (let index = 0; index < text.length; index++) {
      const current = text[index];
      if (current === char) {
        depth++;
      } else if (current === pair && depth-- === 0) {
        return [position, position + 1 + index];
      }
    }
  } else {
    for (let index = text.length - 1; index >= 0; index--) {
      const current = text[index];
      if (current === char) {
        depth++;
      } else if (current === pair && depth-- === 0) {
        return [end + index, position];
      }
    }
  }
  return null;
}

function bracketDecorations(state: EditorState): DecorationSet {
  const head = state.selection.main.head;
  const match = matchBracket(state, head - 1) ?? matchBracket(state, head);
  if (!match || !state.selection.main.empty) {
    return Decoration.none;
  }
  const [from, to] = match;
  return Decoration.set([MARK.range(from, from + 1), MARK.range(to, to + 1)]);
}

export const bracketMatching: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = bracketDecorations(view.state);
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet) {
        this.decorations = bracketDecorations(update.state);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
