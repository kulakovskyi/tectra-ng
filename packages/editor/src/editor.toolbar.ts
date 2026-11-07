import { Command, EditorState } from 'prosemirror-state';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxIconSet } from '@tectra-ng/icons';
import { TxEditorColor, TxEditorTool, TxEditorToolbarPreset } from './editor.types';
import { blockActive, clearFormatting, insertNode, markActive, shiftIndent, toggleBlockType, toggleMark, toggleWrap } from './engine/commands';
import { redo, undo } from './engine/history';
import { chain } from './engine/keymap';
import { currentList, liftCurrentItem, sinkCurrentItem, toggleList } from './engine/lists';
import { txEditorSchema as schema } from './engine/schema';

export interface TxEditorToolSpec {
  icon: string;
  label: keyof TxTranslations;
  shortcut?: string;
  command?: Command;
  active?: (state: EditorState) => boolean;
}

export const TX_EDITOR_TOOLBARS: Record<Exclude<TxEditorToolbarPreset, 'none'>, readonly (readonly TxEditorTool[])[]> = {
  full: [
    ['blockStyle'],
    ['bold', 'italic', 'underline', 'strike', 'code'],
    ['textColor', 'highlight'],
    ['bulletList', 'orderedList', 'taskList', 'align'],
    ['link', 'image', 'blockquote', 'codeBlock'],
    ['clearFormatting'],
  ],
  compact: [['blockStyle'], ['bold', 'italic', 'underline', 'strike', 'code', 'blockquote'], ['bulletList', 'orderedList'], ['link']],
  minimal: [['bold', 'italic', 'underline'], ['bulletList', 'orderedList'], ['link']],
};

const { marks, nodes } = schema;

export const TX_EDITOR_TOOLS: Record<TxEditorTool, TxEditorToolSpec> = {
  undo: { icon: 'undo', label: 'editorUndo', shortcut: 'Mod+Z', command: undo },
  redo: { icon: 'tx-editor-redo', label: 'editorRedo', shortcut: 'Mod+Shift+Z', command: redo },
  blockStyle: { icon: 'heading', label: 'editorTextStyle' },
  fontSize: { icon: 'text', label: 'editorFontSize' },
  bold: { icon: 'bold', label: 'editorBold', shortcut: 'Mod+B', command: toggleMark(marks['bold']), active: (s) => markActive(s, marks['bold']) },
  italic: { icon: 'italic', label: 'editorItalic', shortcut: 'Mod+I', command: toggleMark(marks['italic']), active: (s) => markActive(s, marks['italic']) },
  underline: { icon: 'underline', label: 'editorUnderline', shortcut: 'Mod+U', command: toggleMark(marks['underline']), active: (s) => markActive(s, marks['underline']) },
  strike: { icon: 'strikethrough', label: 'editorStrike', shortcut: 'Mod+Shift+S', command: toggleMark(marks['strike']), active: (s) => markActive(s, marks['strike']) },
  code: { icon: 'code', label: 'editorCode', shortcut: 'Mod+E', command: toggleMark(marks['code']), active: (s) => markActive(s, marks['code']) },
  subscript: { icon: 'subscript', label: 'editorSubscript', shortcut: 'Mod+,', command: toggleMark(marks['subscript']), active: (s) => markActive(s, marks['subscript']) },
  superscript: { icon: 'superscript', label: 'editorSuperscript', shortcut: 'Mod+.', command: toggleMark(marks['superscript']), active: (s) => markActive(s, marks['superscript']) },
  textColor: { icon: 'text-color', label: 'editorTextColor' },
  highlight: { icon: 'highlighter', label: 'editorHighlight' },
  bulletList: { icon: 'list', label: 'editorBulletList', shortcut: 'Mod+Shift+8', command: toggleList(nodes['bullet_list']), active: (s) => currentList(s)?.node.type === nodes['bullet_list'] },
  orderedList: { icon: 'list-ol', label: 'editorOrderedList', shortcut: 'Mod+Shift+7', command: toggleList(nodes['ordered_list']), active: (s) => currentList(s)?.node.type === nodes['ordered_list'] },
  taskList: { icon: 'list-check', label: 'editorTaskList', shortcut: 'Mod+Shift+9', command: toggleList(nodes['task_list']), active: (s) => currentList(s)?.node.type === nodes['task_list'] },
  outdent: { icon: 'outdent', label: 'editorOutdent', shortcut: 'Mod+[', command: chain(liftCurrentItem, shiftIndent(-1)) },
  indent: { icon: 'indent', label: 'editorIndent', shortcut: 'Mod+]', command: chain(sinkCurrentItem, shiftIndent(1)) },
  align: { icon: 'align-left', label: 'editorAlign' },
  link: { icon: 'link', label: 'editorLink', shortcut: 'Mod+K', active: (s) => markActive(s, marks['link']) },
  image: { icon: 'image', label: 'editorImage' },
  video: { icon: 'video', label: 'editorVideo' },
  blockquote: { icon: 'block-quote', label: 'editorQuote', shortcut: 'Mod+Shift+B', command: toggleWrap(nodes['blockquote']), active: (s) => wrappedIn(s, 'blockquote') },
  codeBlock: { icon: 'tx-editor-code-block', label: 'editorCodeBlock', shortcut: 'Mod+Alt+C', command: toggleBlockType(nodes['code_block']), active: (s) => blockActive(s, nodes['code_block']) },
  horizontalRule: { icon: 'horizontal-rule', label: 'editorRule', command: insertNode(nodes['horizontal_rule'].create()) },
  clearFormatting: { icon: 'eraser', label: 'editorClear', command: clearFormatting() },
};

function wrappedIn(state: EditorState, name: string): boolean {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === name) {
      return true;
    }
  }
  return false;
}

export const TX_EDITOR_ALIGN_ICONS = { left: 'align-left', center: 'align-center', right: 'align-right', justify: 'align-justify' } as const;

export const TX_EDITOR_FONT_SIZES = [
  { label: 'editorSizeSmall', value: '0.75em' },
  { label: 'editorSizeNormal', value: null },
  { label: 'editorSizeLarge', value: '1.5em' },
  { label: 'editorSizeHuge', value: '2.5em' },
] as const;

export const TX_EDITOR_TEXT_COLORS: readonly TxEditorColor[] = [
  { label: 'editorColorGray', value: '#6b7280' },
  { label: 'editorColorRed', value: '#dc2626' },
  { label: 'editorColorOrange', value: '#ea580c' },
  { label: 'editorColorYellow', value: '#ca8a04' },
  { label: 'editorColorGreen', value: '#16a34a' },
  { label: 'editorColorTeal', value: '#0d9488' },
  { label: 'editorColorBlue', value: '#2563eb' },
  { label: 'editorColorPurple', value: '#7c3aed' },
  { label: 'editorColorPink', value: '#db2777' },
];

export const TX_EDITOR_HIGHLIGHT_COLORS: readonly TxEditorColor[] = [
  { label: 'editorColorGray', value: 'rgba(107, 114, 128, 0.2)' },
  { label: 'editorColorRed', value: 'rgba(239, 68, 68, 0.22)' },
  { label: 'editorColorOrange', value: 'rgba(249, 115, 22, 0.22)' },
  { label: 'editorColorYellow', value: 'rgba(234, 179, 8, 0.28)' },
  { label: 'editorColorGreen', value: 'rgba(34, 197, 94, 0.22)' },
  { label: 'editorColorTeal', value: 'rgba(20, 184, 166, 0.22)' },
  { label: 'editorColorBlue', value: 'rgba(59, 130, 246, 0.22)' },
  { label: 'editorColorPurple', value: 'rgba(139, 92, 246, 0.22)' },
  { label: 'editorColorPink', value: 'rgba(236, 72, 153, 0.22)' },
];

export function shortcutLabel(shortcut: string, mac: boolean): string {
  return shortcut
    .split('+')
    .map((key) => (key === 'Mod' ? (mac ? '⌘' : 'Ctrl') : key === 'Shift' ? (mac ? '⇧' : 'Shift') : key === 'Alt' ? (mac ? '⌥' : 'Alt') : key))
    .join(mac ? '' : '+');
}

export const TX_EDITOR_ICONS: TxIconSet = {
  'tx-editor-redo': [
    { d: 'M8.5 14L4 9.5L8.5 5', transform: 'matrix(-1 0 0 1 24 0)' },
    { d: 'M4 9.5H15A5 5 0 0 1 15 19.5H11.5', transform: 'matrix(-1 0 0 1 24 0)' },
  ],
  'tx-editor-unlink': [
    'M10.8 6.8L12.8 4.8A3.9 3.9 0 0 1 18.3 10.3L16.3 12.3',
    'M13.2 17.2L11.2 19.2A3.9 3.9 0 0 1 5.7 13.7L7.7 11.7',
    'M8 3.5V5.5',
    'M3.5 8H5.5',
    'M16 18.5V20.5',
    'M18.5 16H20.5',
  ],
  'tx-editor-code-block': [
    'M6 4.5H18A2.5 2.5 0 0 1 20.5 7V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5Z',
    'M9.5 9.5L7 12L9.5 14.5',
    'M14.5 9.5L17 12L14.5 14.5',
  ],
};
