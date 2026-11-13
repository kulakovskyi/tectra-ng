import { TxTranslations } from '@tectra-ng/core/config';

/** A block the `/` menu can insert. */
export type TxEditorSlashCommand =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'blockquote'
  | 'codeBlock'
  | 'callout'
  | 'table'
  | 'divider'
  | 'image'
  | 'video';

/** One entry of the `/` block menu. */
export interface TxEditorSlashItem {
  /** The block the entry inserts. */
  id: TxEditorSlashCommand;
  /** Translation key of the entry name. */
  label: keyof TxTranslations;
  /** Heading level that fills `{level}` in the label. */
  level?: number;
  /** Icon name of the entry. */
  icon: string;
  /** Extra words that find the entry when typed after `/`. */
  keywords: readonly string[];
  /** Keyboard shortcut of the block, shown at the end of the row. */
  shortcut?: string;
}

export const TX_EDITOR_SLASH_ITEMS: readonly TxEditorSlashItem[] = [
  { id: 'paragraph', label: 'editorParagraph', icon: 'paragraph-left', keywords: ['text', 'paragraph', 'p', 'текст', 'абзац'], shortcut: 'Mod+Alt+0' },
  { id: 'heading1', label: 'editorHeading', level: 1, icon: 'heading-1', keywords: ['h1', 'title', 'heading', 'заголовок'], shortcut: 'Mod+Alt+1' },
  { id: 'heading2', label: 'editorHeading', level: 2, icon: 'heading-2', keywords: ['h2', 'subtitle', 'heading', 'заголовок'], shortcut: 'Mod+Alt+2' },
  { id: 'heading3', label: 'editorHeading', level: 3, icon: 'heading-3', keywords: ['h3', 'heading', 'заголовок'], shortcut: 'Mod+Alt+3' },
  { id: 'bulletList', label: 'editorBulletList', icon: 'list', keywords: ['ul', 'bullet', 'list', 'список', 'маркований'], shortcut: 'Mod+Shift+8' },
  { id: 'orderedList', label: 'editorOrderedList', icon: 'list-ol', keywords: ['ol', 'number', 'list', 'список', 'нумерований'], shortcut: 'Mod+Shift+7' },
  { id: 'taskList', label: 'editorTaskList', icon: 'list-check', keywords: ['todo', 'task', 'check', 'завдання', 'чекліст'], shortcut: 'Mod+Shift+9' },
  { id: 'blockquote', label: 'editorQuote', icon: 'block-quote', keywords: ['quote', 'blockquote', 'цитата'], shortcut: 'Mod+Shift+B' },
  { id: 'codeBlock', label: 'editorCodeBlock', icon: 'tx-editor-code-block', keywords: ['code', 'pre', 'snippet', 'код'], shortcut: 'Mod+Alt+C' },
  { id: 'callout', label: 'editorCallout', icon: 'info-circle', keywords: ['callout', 'note', 'info', 'warning', 'tip', 'виноска', 'примітка'] },
  { id: 'table', label: 'editorTable', icon: 'table', keywords: ['table', 'grid', 'таблиця'] },
  { id: 'divider', label: 'editorRule', icon: 'horizontal-rule', keywords: ['hr', 'divider', 'line', 'separator', 'роздільник', 'лінія'] },
  { id: 'image', label: 'editorImage', icon: 'image', keywords: ['image', 'picture', 'photo', 'img', 'зображення', 'картинка', 'фото'] },
  { id: 'video', label: 'editorVideo', icon: 'video', keywords: ['video', 'youtube', 'vimeo', 'embed', 'відео'] },
];

export function matchSlashItems(items: readonly TxEditorSlashItem[], query: string, label: (item: TxEditorSlashItem) => string): TxEditorSlashItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [...items];
  }
  const score = (item: TxEditorSlashItem) => {
    const text = label(item).toLowerCase();
    if (text.startsWith(needle)) {
      return 0;
    }
    if (item.keywords.some((keyword) => keyword.startsWith(needle))) {
      return 1;
    }
    if (text.includes(needle) || item.keywords.some((keyword) => keyword.includes(needle))) {
      return 2;
    }
    return -1;
  };
  return items
    .map((item) => ({ item, rank: score(item) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.item);
}
