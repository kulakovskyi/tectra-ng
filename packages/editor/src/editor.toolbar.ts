import { Command, EditorState } from 'prosemirror-state';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxIconSet } from '@tectra-ng/icons';
import { TxEditorColor, TxEditorTool, TxEditorToolbarPreset } from './editor.types';
import { blockActive, clearFormatting, insertNode, markActive, shiftIndent, toggleBlockType, toggleMark, toggleWrap } from './engine/commands';
import { redo, undo } from './engine/history';
import { chain } from './engine/keymap';
import { currentList, liftCurrentItem, sinkCurrentItem, toggleList } from './engine/lists';
import { txEditorSchema as schema } from './engine/schema';
import { insertTable, tableContext } from './engine/tables';

/** How one toolbar tool looks and works: icon, label, shortcut and command. */
export interface TxEditorToolSpec {
  /** Name of the toolbar icon. */
  icon: string;
  /** Translation key of the tool name, used as tooltip and accessible name. */
  label: keyof TxTranslations;
  /** Keyboard shortcut written with `Mod` for Ctrl or Cmd, such as `Mod+B`. */
  shortcut?: string;
  /** Runs when the tool is pressed; missing for tools that open a menu or a popover. */
  command?: Command;
  /** Tells whether the tool is on at the current selection, which shows it pressed. */
  active?: (state: EditorState) => boolean;
}

/** The groups of tools of each toolbar preset. */
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

/** Icon, label, shortcut and command of every toolbar tool. */
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
  table: { icon: 'table', label: 'editorTable', command: insertTable, active: (s) => !!tableContext(s) },
  callout: { icon: 'info-circle', label: 'editorCallout', command: toggleWrap(nodes['callout']), active: (s) => wrappedIn(s, 'callout') },
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

/** Icon name of each text alignment. */
export const TX_EDITOR_ALIGN_ICONS = { left: 'align-left', center: 'align-center', right: 'align-right', justify: 'align-justify' } as const;

/** Choices of the font size menu: a translation key and the CSS size in `em`, `null` for the normal size. */
export const TX_EDITOR_FONT_SIZES = [
  { label: 'editorSizeSmall', value: '0.75em' },
  { label: 'editorSizeNormal', value: null },
  { label: 'editorSizeLarge', value: '1.5em' },
  { label: 'editorSizeHuge', value: '2.5em' },
] as const;

/** Palette of the text colour tool. */
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

/** Palette of the highlight tool, in translucent colours that work on light and dark backgrounds. */
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

/** Writes a shortcut for display: `Mod` becomes the Cmd symbol on Mac and `Ctrl` elsewhere. */
export function shortcutLabel(shortcut: string, mac: boolean): string {
  return shortcut
    .split('+')
    .map((key) => (key === 'Mod' ? (mac ? '⌘' : 'Ctrl') : key === 'Shift' ? (mac ? '⇧' : 'Shift') : key === 'Alt' ? (mac ? '⌥' : 'Alt') : key))
    .join(mac ? '' : '+');
}

/** Icons the editor draws itself; register them once to use their names elsewhere. */
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
  'tx-editor-row-above': ['M4 13.5H20V19.5H4Z', 'M12 3.5V10', 'M8.75 6.75H15.25'],
  'tx-editor-row-below': ['M4 4.5H20V10.5H4Z', 'M12 14V20.5', 'M8.75 17.25H15.25'],
  'tx-editor-column-left': ['M13.5 4H19.5V20H13.5Z', 'M3.5 12H10', 'M6.75 8.75V15.25'],
  'tx-editor-column-right': ['M4.5 4H10.5V20H4.5Z', 'M14 12H20.5', 'M17.25 8.75V15.25'],
  'tx-editor-header-row': ['M5 4.5H19A1.5 1.5 0 0 1 20.5 6V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z', { d: 'M3.5 6A1.5 1.5 0 0 1 5 4.5H19A1.5 1.5 0 0 1 20.5 6V9.5H3.5Z', fill: true }, 'M3.5 14.5H20.5', 'M12 9.5V19.5'],
  'tx-editor-delete-row': ['M4 8.5H20V15.5H4Z', 'M9.5 10.5L14.5 13.5', 'M14.5 10.5L9.5 13.5'],
  'tx-editor-delete-column': ['M8.5 4H15.5V20H8.5Z', 'M10.5 9.5L13.5 14.5', 'M13.5 9.5L10.5 14.5'],
  'tx-editor-code-block': [
    'M6 4.5H18A2.5 2.5 0 0 1 20.5 7V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V7A2.5 2.5 0 0 1 6 4.5Z',
    'M9.5 9.5L7 12L9.5 14.5',
    'M14.5 9.5L17 12L14.5 14.5',
  ],
};
