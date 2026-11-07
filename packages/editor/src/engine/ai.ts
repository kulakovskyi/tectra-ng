import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface TxAiRange {
  from: number;
  to: number;
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
