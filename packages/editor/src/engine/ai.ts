import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/** The text an AI action works on, marked while it is pending and when its answer is in. */
export interface TxAiRange {
  /** Start position in the document. */
  from: number;
  /** End position in the document. */
  to: number;
  /** `true` once the answer replaced the text, `false` while it is awaited. */
  done: boolean;
}

export const aiKey = new PluginKey<TxAiRange | null>('txAi');

export function aiPlugin(): Plugin<TxAiRange | null> {
  return new Plugin<TxAiRange | null>({
    key: aiKey,
    state: {
      init: () => null,
      apply(tr: Transaction, value) {
        const meta = tr.getMeta(aiKey) as TxAiRange | null | undefined;
        if (meta !== undefined) {
          return meta;
        }
        if (!value || !tr.docChanged) {
          return value;
        }
        return { from: tr.mapping.map(value.from, -1), to: tr.mapping.map(value.to, 1), done: value.done };
      },
    },
    props: {
      decorations(state) {
        const range = aiKey.getState(state);
        if (!range || range.from >= range.to) {
          return null;
        }
        const className = range.done ? 'tx-editor__ai-result' : 'tx-editor__ai-pending';
        return DecorationSet.create(state.doc, [Decoration.inline(range.from, range.to, { class: className })]);
      },
    },
  });
}
