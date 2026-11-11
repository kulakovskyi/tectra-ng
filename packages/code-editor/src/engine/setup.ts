import { Compartment, EditorState, Extension, Prec } from '@codemirror/state';
import {
  EditorView,
  KeyBinding,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from '@codemirror/view';
import { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';
import { bracketMatching } from './brackets';
import {
  autoClose,
  copyLineDown,
  copyLineUp,
  deleteLine,
  indentLess,
  indentMore,
  insertNewline,
  insertTab,
  moveLineDown,
  moveLineUp,
  selectAll,
  smartBackspace,
  toggleComment,
} from './commands';
import { syntaxHighlight } from './highlight';
import { historyField, redo, undo } from './history';
import { codeLanguage } from './language';
import { indentGuides } from './indent-guides';
import { wrapIndent } from './wrap-indent';
import { searchMarks } from './search';

export interface TxCodeEditorSettings {
  readonly language: TxCodeLanguage;
  readonly readOnly: boolean;
  readonly editable: boolean;
  readonly lineNumbers: boolean;
  readonly wordWrap: boolean;
  readonly tabSize: number;
  readonly placeholder: string;
  readonly attributes: Record<string, string>;
  readonly indentGuides: boolean;
}

export type TxCodeCompartmentName = 'language' | 'readOnly' | 'gutter' | 'wrap' | 'tabSize' | 'placeholder' | 'attributes' | 'guides';

export class TxCodeEditorCompartments {
  readonly language = new Compartment();
  readonly readOnly = new Compartment();
  readonly gutter = new Compartment();
  readonly wrap = new Compartment();
  readonly tabSize = new Compartment();
  readonly placeholder = new Compartment();
  readonly attributes = new Compartment();
  readonly guides = new Compartment();

  languageExtension(language: TxCodeLanguage): Extension {
    return [codeLanguage.of(language), syntaxHighlight(language)];
  }

  readOnlyExtension(readOnly: boolean, editable: boolean): Extension {
    return [EditorState.readOnly.of(readOnly || !editable), EditorView.editable.of(editable)];
  }

  gutterExtension(enabled: boolean): Extension {
    return enabled ? [lineNumbers(), highlightActiveLineGutter()] : [];
  }

  wrapExtension(enabled: boolean): Extension {
    return enabled ? [EditorView.lineWrapping, wrapIndent] : [];
  }

  tabSizeExtension(size: number): Extension {
    return EditorState.tabSize.of(size);
  }

  placeholderExtension(text: string): Extension {
    return text ? placeholder(text) : [];
  }

  guidesExtension(enabled: boolean): Extension {
    return enabled ? indentGuides : [];
  }

  attributesExtension(attributes: Record<string, string>): Extension {
    return EditorView.contentAttributes.of(attributes);
  }

  initial(settings: TxCodeEditorSettings): Extension {
    return [
      this.language.of(this.languageExtension(settings.language)),
      this.readOnly.of(this.readOnlyExtension(settings.readOnly, settings.editable)),
      this.gutter.of(this.gutterExtension(settings.lineNumbers)),
      this.wrap.of(this.wrapExtension(settings.wordWrap)),
      this.tabSize.of(this.tabSizeExtension(settings.tabSize)),
      this.placeholder.of(this.placeholderExtension(settings.placeholder)),
      this.attributes.of(this.attributesExtension(settings.attributes)),
      this.guides.of(this.guidesExtension(settings.indentGuides)),
    ];
  }
}

export const TX_CODE_EDITING_KEYS: readonly KeyBinding[] = [
  { key: 'Mod-z', run: undo, preventDefault: true },
  { key: 'Mod-Shift-z', run: redo, preventDefault: true },
  { key: 'Mod-y', run: redo, preventDefault: true },
  { key: 'Enter', run: insertNewline },
  { key: 'Backspace', run: smartBackspace },
  { key: 'Mod-/', run: toggleComment, preventDefault: true },
  { key: 'Mod-]', run: indentMore, preventDefault: true },
  { key: 'Mod-[', run: indentLess, preventDefault: true },
  { key: 'Alt-ArrowUp', run: moveLineUp, preventDefault: true },
  { key: 'Alt-ArrowDown', run: moveLineDown, preventDefault: true },
  { key: 'Shift-Alt-ArrowUp', run: copyLineUp, preventDefault: true },
  { key: 'Shift-Alt-ArrowDown', run: copyLineDown, preventDefault: true },
  { key: 'Mod-Shift-k', run: deleteLine, preventDefault: true },
  { key: 'Mod-a', run: selectAll, preventDefault: true },
];

export function tabKeys(escaped: () => boolean): KeyBinding[] {
  return [
    { key: 'Tab', run: (view) => !escaped() && insertTab(view) },
    { key: 'Shift-Tab', run: (view) => !escaped() && indentLess(view) },
  ];
}

export function codeEditorBase(): Extension {
  return [
    historyField,
    searchMarks,
    drawSelection(),
    highlightActiveLine(),
    bracketMatching,
    autoClose,
    EditorState.allowMultipleSelections.of(true),
    Prec.high(keymap.of(TX_CODE_EDITING_KEYS as KeyBinding[])),
  ];
}
