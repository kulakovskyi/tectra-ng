import { MarkType, NodeType } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';
import { txEditorSchema as schema } from './schema';

interface TxInputRule {
  match: RegExp;
  prefix?: boolean;
  handler: (state: EditorState, match: RegExpMatchArray, start: number, end: number) => Transaction | null;
}

const MAX_MATCH = 500;

function blockRule(match: RegExp, type: NodeType, attrs?: (match: RegExpMatchArray) => Record<string, unknown>): TxInputRule {
  return {
    match,
    handler: (state, found, start, end) => {
      const $start = state.doc.resolve(start);
      if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), type)) {
        return null;
      }
      return state.tr.delete(start, end).setBlockType(start, start, type, attrs?.(found) ?? null);
    },
  };
}

function wrapRule(match: RegExp, type: NodeType, attrs?: (match: RegExpMatchArray) => Record<string, unknown>): TxInputRule {
  return {
    match,
    handler: (state, found, start, end) => {
      const tr = state.tr.delete(start, end);
      const $start = tr.doc.resolve(start);
      const range = $start.blockRange();
      const wrapping = range && findWrapping(range, type, attrs?.(found) ?? null);
      if (!range || !wrapping) {
        return null;
      }
      tr.wrap(range, wrapping);
      const before = tr.doc.resolve(start - 1).nodeBefore;
      if (before && before.type === type && before.type.compatibleContent(type)) {
        tr.join(start - 1);
      }
      return tr;
    },
  };
}

function markRule(match: RegExp, type: MarkType): TxInputRule {
  return {
    match,
    prefix: true,
    handler: (state, found, start, end) => {
      const inner = found[2];
      if (!inner) {
        return null;
      }
      const marker = (found[0].length - found[1].length - inner.length) / 2;
      const tr = state.tr;
      tr.delete(start + marker + inner.length, end);
      tr.delete(start, start + marker);
      tr.addMark(start, start + inner.length, type.create());
      tr.removeStoredMark(type);
      return tr;
    },
  };
}

function hrRule(): TxInputRule {
  return {
    match: /^(?:---|___|\*\*\*)$/,
    handler: (state, _found, start, end) => {
      const $start = state.doc.resolve(start);
      if ($start.parent.type.name !== 'paragraph' || $start.parent.content.size !== end - $start.start()) {
        return null;
      }
      const blockStart = $start.before();
      const blockEnd = $start.after();
      return state.tr.replaceWith(blockStart, blockEnd, [schema.nodes['horizontal_rule'].create(), schema.nodes['paragraph'].create()]);
    },
  };
}

export function txInputRules(): Plugin {
  const rules: TxInputRule[] = [
    blockRule(/^(#{1,6})\s$/, schema.nodes['heading'], (match) => ({ level: match[1].length })),
    wrapRule(/^\s*>\s$/, schema.nodes['blockquote']),
    wrapRule(/^\s*\[([ xX]?)\]\s$/, schema.nodes['task_list']),
    wrapRule(/^\s*([-+*])\s$/, schema.nodes['bullet_list']),
    wrapRule(/^\s*(\d+)\.\s$/, schema.nodes['ordered_list'], (match) => ({ start: Number(match[1]) })),
    blockRule(/^```([\w-]*)\s$/, schema.nodes['code_block'], (match) => ({ language: match[1] || null })),
    hrRule(),
    markRule(/(^|[^*\w])\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/, schema.marks['bold']),
    markRule(/(^|[^_\w])__([^_\s](?:[^_]*[^_\s])?)__$/, schema.marks['bold']),
    markRule(/(^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*$/, schema.marks['italic']),
    markRule(/(^|[^_\w])_([^_\s](?:[^_]*[^_\s])?)_$/, schema.marks['italic']),
    markRule(/(^|[^~\w])~~([^~\s](?:[^~]*[^~\s])?)~~$/, schema.marks['strike']),
    markRule(/(^|[^`\w])`([^`]+)`$/, schema.marks['code']),
  ];
  return new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        const state = view.state;
        const $from = state.doc.resolve(from);
        if (view.composing || $from.parent.type.spec.code) {
          return false;
        }
        const before = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined, '￼') + text;
        for (const rule of rules) {
          const match = rule.match.exec(before);
          if (!match) {
            continue;
          }
          const start = from - (match[0].length - text.length) + (rule.prefix ? match[1].length : 0);
          const tr = rule.handler(state, match, start, to);
          if (tr) {
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
    },
  });
}
