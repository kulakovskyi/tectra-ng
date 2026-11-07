import { Command, Plugin } from 'prosemirror-state';
import {
  deleteSelection,
  exitCode,
  headingToParagraphAtStart,
  insertHardBreak,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  liftFromQuoteAtStart,
  newlineInCode,
  outdentAtStart,
  selectAll,
  setBlockType,
  shiftIndent,
  splitBlock,
  toggleBlockType,
  toggleMark,
  toggleWrap,
} from './commands';
import { dropCursor } from './drop-cursor';
import { history, redo, undo } from './history';
import { txInputRules } from './input-rules';
import { chain, keymap } from './keymap';
import { liftCurrentItem, liftEmptyListItem, liftListItemAtStart, sinkCurrentItem, splitListItem, toggleList } from './lists';
import { TxSuggestionHandlers, autolinkPlugin, maxLengthPlugin, placeholderPlugin, suggestionPlugin } from './plugins';
import { txEditorSchema as schema } from './schema';

export interface TxEditorEngineOptions {
  placeholder: () => string;
  maxLength: () => number | undefined;
  linkTarget: () => string | null;
  mentionTrigger: () => string | null;
  suggestion: TxSuggestionHandlers;
  openLink: () => void;
}

export function editorKeymap(openLink: () => void): Record<string, Command> {
  const { marks, nodes } = schema;
  const headings = Object.fromEntries([1, 2, 3, 4, 5, 6].map((level) => [`Mod-Alt-${level}`, toggleBlockType(nodes['heading'], { level })]));
  return {
    'Mod-z': undo,
    'Mod-Shift-z': redo,
    'Mod-y': redo,
    'Mod-b': toggleMark(marks['bold']),
    'Mod-i': toggleMark(marks['italic']),
    'Mod-u': toggleMark(marks['underline']),
    'Mod-Shift-s': toggleMark(marks['strike']),
    'Mod-e': toggleMark(marks['code']),
    'Mod-,': toggleMark(marks['subscript']),
    'Mod-.': toggleMark(marks['superscript']),
    'Mod-Shift-7': toggleList(nodes['ordered_list']),
    'Mod-Shift-8': toggleList(nodes['bullet_list']),
    'Mod-Shift-9': toggleList(nodes['task_list']),
    'Mod-Shift-b': toggleWrap(nodes['blockquote']),
    'Mod-Alt-c': toggleBlockType(nodes['code_block']),
    'Mod-Alt-0': setBlockType(nodes['paragraph']),
    ...headings,
    'Mod-]': chain(sinkCurrentItem, shiftIndent(1)),
    'Mod-[': chain(liftCurrentItem, shiftIndent(-1)),
    'Mod-k': () => {
      openLink();
      return true;
    },
    Tab: sinkCurrentItem,
    'Shift-Tab': liftCurrentItem,
    Enter: chain(newlineInCode, splitListItem(), liftEmptyListItem, liftEmptyBlock, splitBlock),
    'Shift-Enter': insertHardBreak,
    'Mod-Enter': exitCode,
    Backspace: chain(deleteSelection, liftListItemAtStart, outdentAtStart, liftFromQuoteAtStart, headingToParagraphAtStart, joinBackward),
    Delete: chain(deleteSelection, joinForward),
    'Mod-a': selectAll,
  };
}

export function editorPlugins(options: TxEditorEngineOptions): Plugin[] {
  return [
    suggestionPlugin(options.mentionTrigger, options.suggestion),
    txInputRules(),
    keymap(editorKeymap(options.openLink)),
    history(),
    placeholderPlugin(options.placeholder),
    maxLengthPlugin(options.maxLength),
    autolinkPlugin(options.linkTarget),
    dropCursor(),
  ];
}
