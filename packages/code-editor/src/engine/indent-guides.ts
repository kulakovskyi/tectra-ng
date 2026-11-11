import { Extension, RangeSetBuilder } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { guideLevels } from '@tectra-ng/code-editor/highlight';

const CACHE = new Map<string, Decoration>();

function guideDecoration(levels: number, tabSize: number): Decoration {
  const key = `${levels}:${tabSize}`;
  let decoration = CACHE.get(key);
  if (!decoration) {
    decoration = Decoration.line({
      class: 'tx-code-guides',
      attributes: { style: `--tx-code-guides: ${levels}; --tx-code-guide-step: ${tabSize}ch` },
    });
    CACHE.set(key, decoration);
  }
  return decoration;
}

function build(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  const tabSize = view.state.tabSize;
  const text = (index: number) => doc.line(index + 1).text;
  let last = 0;
  for (const { from, to } of view.visibleRanges) {
    const first = Math.max(doc.lineAt(from).number, last + 1);
    const end = doc.lineAt(to).number;
    if (first > end) {
      continue;
    }
    guideLevels(doc.lines, text, tabSize, first - 1, end).forEach((levels, offset) => {
      if (levels > 0) {
        const line = doc.line(first + offset);
        builder.add(line.from, line.from, guideDecoration(levels, tabSize));
      }
    });
    last = end;
  }
  return builder.finish();
}

export const indentGuides: Extension = ViewPlugin.fromClass(
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
