export type TxEditorTool =
  | 'undo'
  | 'redo'
  | 'blockStyle'
  | 'fontSize'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'subscript'
  | 'superscript'
  | 'textColor'
  | 'highlight'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'outdent'
  | 'indent'
  | 'align'
  | 'link'
  | 'image'
  | 'video'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'clearFormatting'
  | 'table'
  | 'callout';

export type TxEditorToolbarPreset = 'full' | 'compact' | 'minimal' | 'none';

export type TxEditorToolbar = TxEditorToolbarPreset | readonly (readonly TxEditorTool[])[];

export type TxEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type TxEditorAlign = 'left' | 'center' | 'right' | 'justify';

export type TxEditorPart = 'root' | 'toolbar' | 'tool' | 'content' | 'footer' | 'bubble' | 'suggestions';

export interface TxEditorColor {
  label: string;
  value: string;
}

export interface TxEditorMentionItem {
  id: string;
  label: string;
  description?: string;
  avatar?: string;
}

export type TxEditorMentionSource = (query: string) => readonly TxEditorMentionItem[] | Promise<readonly TxEditorMentionItem[]>;

export type TxEditorImageUpload = (file: File) => Promise<string>;

export interface TxEditorImageRejection {
  file: File;
  reason: 'type' | 'size';
  message: string;
}

export interface TxEditorSelection {
  from: number;
  to: number;
  empty: boolean;
  text: string;
}

export interface TxEditorTextChange {
  html: string;
  text: string;
}

export interface TxEditorAiAction {
  id: string;
  label: string;
  icon?: string;
}

export interface TxEditorAiRequest {
  action: TxEditorAiAction;
  text: string;
  html: string;
  replace: (content: string | AsyncIterable<string>) => Promise<void>;
}
