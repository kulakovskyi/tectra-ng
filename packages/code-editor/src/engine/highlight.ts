import { Extension, RangeSetBuilder } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { TxCodeLanguage, TxCodeLineStates, TxCodeTokenType, getCodeMode, tokenClass } from '@tectra-ng/code-editor/highlight';

const MARKS = new Map<TxCodeTokenType, Decoration>();

export function tokenMark(type: TxCodeTokenType): Decoration {
  let mark = MARKS.get(type);
  if (!mark) {
    mark = Decoration.mark({ class: tokenClass(type) });
    MARKS.set(type, mark);
  }
  return mark;
}

export function syntaxHighlight(language: TxCodeLanguage): Extension {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private readonly states = new TxCodeLineStates(getCodeMode(language));

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }

      update(update: ViewUpdate): void {
        if (update.docChanged) {
          let first = update.startState.doc.length;
          update.changes.iterChangedRanges((fromA) => {
            first = Math.min(first, fromA);
          });
          this.states.invalidateFrom(update.startState.doc.lineAt(first).number - 1);
        }
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.build(update.view);
        }
      }

      private build(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc;
        const lineText = (index: number) => doc.line(index + 1).text;
        let done = 0;
        for (const { from, to } of view.visibleRanges) {
          for (let number = Math.max(doc.lineAt(from).number, done + 1); number <= doc.lines; number++) {
            const line = doc.line(number);
            if (line.from > to) {
              break;
            }
            for (const token of this.states.tokens(number - 1, lineText)) {
              builder.add(line.from + token.from, line.from + token.to, tokenMark(token.type));
            }
            done = number;
          }
        }
        return builder.finish();
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}
