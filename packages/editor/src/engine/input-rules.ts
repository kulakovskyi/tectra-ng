import { MarkType, NodeType } from 'prosemirror-model';
import { Command, EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';
import { txEditorSchema as schema } from './schema';

interface TxInputRule {
  match: RegExp;
  prefix?: boolean;
  handler: (state: EditorState, match: RegExpMatchArray, start: number, end: number) => Transaction | null;
}

const MAX_MATCH = 500;

export interface TxTypographyOptions {
  enabled: () => boolean;
  quotes: () => readonly [string, string, string, string];
}

interface TxUndoable {
  from: number;
  to: number;
  text: string;
}

const undoKey = new PluginKey<TxUndoable | null>('txInputRuleUndo');

function replaceRule(match: RegExp, replacement: (found: RegExpMatchArray) => string): TxInputRule {
  return {
    match,
    prefix: true,
    handler: (state, found, start, end) => {
      const text = replacement(found);
      const tr = state.tr.insertText(text, start, end);
      return tr.setMeta(undoKey, { from: start, to: start + text.length, text: found[0].slice(found[1].length) });
    },
  };
}

function typographyRules(options: TxTypographyOptions): TxInputRule[] {
  const quote = (index: number) => () => options.quotes()[index];
  return [
    replaceRule(/(^|[^-])--\s$/, () => '— '),
    replaceRule(/(^|[^-])->$/, () => '→'),
    replaceRule(/(^|[^<])<-$/, () => '←'),
    replaceRule(/(^|[^.])\.\.\.$/, () => '…'),
    replaceRule(/(^|[^(])\([cC]\)$/, () => '©'),
    replaceRule(/(^|[^(])\([tT][mM]\)$/, () => '™'),
    replaceRule(/(^|[\s([{\u2014])"$/, quote(0)),
    replaceRule(/(^|[^\s([{\u2014])"$/, quote(1)),
    replaceRule(/(^|[\s([{\u2014])'$/, quote(2)),
    replaceRule(/([\p{L}\p{N}])'$/u, () => '’'),
    replaceRule(/(^|[^\s([{\u2014])'$/, quote(3)),
  ];
}

export const undoInputRule: Command = (state, dispatch) => {
  const undoable = undoKey.getState(state);
  if (!undoable || state.selection.from !== undoable.to || !state.selection.empty) {
    return false;
  }
  dispatch?.(state.tr.insertText(undoable.text, undoable.from, undoable.to).setMeta(undoKey, null));
  return true;
};

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

export function txInputRules(typography?: TxTypographyOptions): Plugin {
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
  const typographic = typography ? typographyRules(typography) : [];
  return new Plugin<TxUndoable | null>({
    key: undoKey,
    state: {
      init: () => null,
      apply(tr, value) {
        const meta = tr.getMeta(undoKey) as TxUndoable | null | undefined;
        if (meta !== undefined) {
          return meta;
        }
        return tr.docChanged || tr.selectionSet ? null : value;
      },
    },
    props: {
      handleTextInput(view, from, to, text) {
        const state = view.state;
        const $from = state.doc.resolve(from);
        if (view.composing || $from.parent.type.spec.code) {
          return false;
        }
        const before = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, undefined, '￼') + text;
        const inCode = !!schema.marks['code'].isInSet(state.storedMarks ?? $from.marks());
        for (const rule of [...rules, ...(typography?.enabled() && !inCode ? typographic : [])]) {
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
