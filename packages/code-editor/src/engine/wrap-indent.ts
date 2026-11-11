import { Extension, RangeSetBuilder } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { lineIndent } from '@tectra-ng/code-editor/highlight';

const CACHE = new Map<string, Decoration>();

function indentDecoration(indent: string): Decoration {
  let decoration = CACHE.get(indent);
  if (!decoration) {
    decoration = Decoration.line({ class: 'tx-code-wrap-indent', attributes: { style: `--tx-code-wrap-indent: ${indent}` } });
    CACHE.set(indent, decoration);
  }
  return decoration;
}

function build(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  let last = 0;
  for (const { from, to } of view.visibleRanges) {
    for (let number = Math.max(doc.lineAt(from).number, last + 1); number <= doc.lines; number++) {
      const line = doc.line(number);
      if (line.from > to) {
        break;
      }
      const indent = lineIndent(line.text, view.state.tabSize);
      if (indent) {
        builder.add(line.from, line.from, indentDecoration(indent));
      }
      last = number;
    }
  }
  return builder.finish();
}

export const wrapIndent: Extension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = build(view);
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged || update.startState.tabSize !== update.state.tabSize) {
        this.decorations = build(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
