import { Node as ProseNode } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { txEditorSchema as schema } from './schema';

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]}]|[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|dev|app|ua|co|ai|me|info|biz|eu|uk|de|pl|us)(?:\/[^\s<>"']*[^\s<>"'.,;:!?)\]}])?/gi;

export function textLength(doc: ProseNode): number {
  return doc.textBetween(0, doc.content.size, '\n', '​').length;
}

export function placeholderPlugin(text: () => string): Plugin {
  return new Plugin({
    props: {
      decorations(state) {
        const doc = state.doc;
        const only = doc.childCount === 1 ? doc.firstChild : null;
        if (!only || !only.isTextblock || only.content.size > 0 || only.type.name !== 'paragraph') {
          return null;
        }
        const placeholder = text();
        return placeholder ? DecorationSet.create(doc, [Decoration.node(0, only.nodeSize, { class: 'tx-editor__placeholder', 'data-placeholder': placeholder })]) : null;
      },
    },
  });
}

export function maxLengthPlugin(limit: () => number | undefined): Plugin {
  return new Plugin({
    filterTransaction(tr, state) {
      const max = limit();
      if (!max || !tr.docChanged || tr.getMeta('addToHistory') === false) {
        return true;
      }
      const next = textLength(tr.doc);
      return next <= max || next <= textLength(state.doc);
    },
  });
}

export function normalizeHref(value: string): string {
  const url = value.trim();
  if (/^(https?:|mailto:|tel:|sms:)/i.test(url) || url.startsWith('/') || url.startsWith('#')) {
    return url;
  }
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(url)) {
    return `mailto:${url}`;
  }
  if (/^\+?[\d\s()-]{6,}$/.test(url)) {
    return `tel:${url.replace(/[\s()-]/g, '')}`;
  }
  return `https://${url}`;
}

function linkMatches(text: string): { start: number; end: number; href: string }[] {
  return Array.from(text.matchAll(URL_PATTERN)).map((match) => ({ start: match.index, end: match.index + match[0].length, href: normalizeHref(match[0]) }));
}

function linkTextblock(tr: Transaction, node: ProseNode, pos: number, target: string | null, limit?: { from: number; to: number }): void {
  if (node.type.spec.code) {
    return;
  }
  const type = schema.marks['link'];
  const start = pos + 1;
  const text = node.textBetween(0, node.content.size, undefined, '￼');
  for (const match of linkMatches(text)) {
    const from = start + match.start;
    const to = start + match.end;
    if (limit && (to < limit.from || from > limit.to)) {
      continue;
    }
    if (tr.doc.rangeHasMark(from, to, type) || tr.doc.rangeHasMark(from, to, schema.marks['code'])) {
      continue;
    }
    tr.addMark(from, to, type.create({ href: match.href, target }));
  }
}

export function autolinkPlugin(target: () => string | null): Plugin {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged) || transactions.some((tr) => tr.getMeta('addToHistory') === false)) {
        return null;
      }
      const pasted = transactions.some((tr) => tr.getMeta('uiEvent') === 'paste' || tr.getMeta('uiEvent') === 'drop');
      const tr = newState.tr;
      if (pasted) {
        const ranges: { from: number; to: number }[] = [];
        transactions.forEach((transaction) =>
          transaction.mapping.maps.forEach((map) => map.forEach((_oldFrom, _oldTo, from, to) => ranges.push({ from, to }))),
        );
        for (const range of ranges) {
          const from = Math.max(0, Math.min(range.from, newState.doc.content.size));
          const to = Math.max(from, Math.min(range.to, newState.doc.content.size));
          newState.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isTextblock) {
              linkTextblock(tr, node, pos, target(), { from, to });
              return false;
            }
            return true;
          });
        }
      } else {
        const { $cursor } = newState.selection as TextSelection;
        const typed = $cursor && $cursor.parentOffset > 0 ? $cursor.parent.textBetween($cursor.parentOffset - 1, $cursor.parentOffset, undefined, '￼') : '';
        const oldCursor = (oldState.selection as TextSelection).$cursor;
        const enter = $cursor && oldCursor && $cursor.parentOffset === 0 && $cursor.index(0) === oldCursor.index(0) + 1;
        if ($cursor && /\s/.test(typed)) {
          const end = $cursor.pos - 1;
          linkTextblock(tr, $cursor.parent, $cursor.before(), target(), { from: end - 1, to: end });
        } else if (enter && oldCursor) {
          const previous = newState.doc.child($cursor.index(0) - 1);
          let position = 0;
          for (let index = 0; index < $cursor.index(0) - 1; index++) {
            position += newState.doc.child(index).nodeSize;
          }
          if (previous.isTextblock) {
            linkTextblock(tr, previous, position, target(), { from: position + previous.nodeSize - 2, to: position + previous.nodeSize - 1 });
          }
        }
      }
      return tr.docChanged ? tr : null;
    },
  });
}

export type TxSuggestionKind = 'mention' | 'slash' | 'emoji';

export interface TxSuggestionTrigger {
  kind: TxSuggestionKind;
  char: string;
  minLength: number;
}

export interface TxSuggestionMatch {
  kind: TxSuggestionKind;
  from: number;
  to: number;
  query: string;
}

export interface TxSuggestionHandlers {
  change: (match: TxSuggestionMatch | null, view: EditorView) => void;
  keydown: (event: KeyboardEvent) => boolean;
}

export const suggestionKey = new PluginKey<{ dismissedAt: number | null }>('txSuggestion');

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findSuggestion(state: EditorState, triggers: readonly TxSuggestionTrigger[]): TxSuggestionMatch | null {
  const { $cursor } = state.selection as TextSelection;
  if (!$cursor || $cursor.parent.type.spec.code) {
    return null;
  }
  const text = $cursor.parent.textBetween(Math.max(0, $cursor.parentOffset - 60), $cursor.parentOffset, undefined, '\ufffc');
  for (const trigger of triggers) {
    const pattern = trigger.kind === 'emoji' ? '[\\p{L}\\p{N}_+-]' : '[\\p{L}\\p{N}_.-]';
    const space = trigger.kind === 'slash' ? '[\\p{L}\\p{N}_ -]' : pattern;
    const match = new RegExp(`(?:^|\\s)${escapeRegExp(trigger.char)}(${pattern}${space}{0,30})?$`, 'u').exec(text);
    if (!match) {
      continue;
    }
    const query = match[1] ?? '';
    if (query.length < trigger.minLength) {
      continue;
    }
    const length = query.length + trigger.char.length;
    return { kind: trigger.kind, from: $cursor.pos - length, to: $cursor.pos, query };
  }
  return null;
}

export function suggestionPlugin(triggers: () => readonly TxSuggestionTrigger[], handlers: TxSuggestionHandlers): Plugin {
  let active = false;
  return new Plugin<{ dismissedAt: number | null }>({
    key: suggestionKey,
    state: {
      init: (): { dismissedAt: number | null } => ({ dismissedAt: null }),
      apply(tr, value) {
        const meta = tr.getMeta(suggestionKey) as { dismissedAt: number | null } | undefined;
        if (meta) {
          return meta;
        }
        return value.dismissedAt === null ? value : { dismissedAt: tr.mapping.map(value.dismissedAt) };
      },
    },
    view: () => ({
      update(view) {
        const match = view.hasFocus() ? findSuggestion(view.state, triggers()) : null;
        const dismissed = suggestionKey.getState(view.state)?.dismissedAt;
        const shown = match && match.from !== dismissed ? match : null;
        active = !!shown;
        handlers.change(shown, view);
      },
      destroy() {
        active = false;
      },
    }),
    props: {
      handleKeyDown(view, event) {
        if (!active) {
          return false;
        }
        if (event.key === 'Escape') {
          const match = findSuggestion(view.state, triggers());
          view.dispatch(view.state.tr.setMeta(suggestionKey, { dismissedAt: match?.from ?? null }));
          return true;
        }
        return handlers.keydown(event);
      },
    },
  });
}

export function selectionText(state: EditorState): string {
  const { from, to } = state.selection;
  return state.doc.textBetween(from, to, '\n', '￼');
}
