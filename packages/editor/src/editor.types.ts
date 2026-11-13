/** A button of the toolbar; list them in `toolbar` to build your own layout. */
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

/** A ready toolbar layout: `full`, `compact`, `minimal` or `none` (no toolbar). */
export type TxEditorToolbarPreset = 'full' | 'compact' | 'minimal' | 'none';

/** The toolbar: a preset name, or your own groups of tools, each inner list being one group. */
export type TxEditorToolbar = TxEditorToolbarPreset | readonly (readonly TxEditorTool[])[];

/** Heading level, 1 to 6. */
export type TxEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Text alignment of a block. */
export type TxEditorAlign = 'left' | 'center' | 'right' | 'justify';

/** Parts of `tx-editor` that `pt` can style. */
export type TxEditorPart = 'root' | 'toolbar' | 'tool' | 'content' | 'footer' | 'bubble' | 'suggestions';

/** A colour of the text or highlight palette. */
export interface TxEditorColor {
  /** Translation key of the colour name shown as its tooltip. */
  label: string;
  /** CSS colour applied to the text or its background. */
  value: string;
}

/** One entry of the `@` mention list. */
export interface TxEditorMentionItem {
  /** Identifier stored in the mention. */
  id: string;
  /** Name shown in the list and in the text. */
  label: string;
  /** Second line under the name in the list. */
  description?: string;
  /** Image URL of a round picture before the name. */
  avatar?: string;
}

/**
 * Finds the people or things offered after `@`: gets the typed query and returns the items or a Promise of them.
 */
export type TxEditorMentionSource = (query: string) => readonly TxEditorMentionItem[] | Promise<readonly TxEditorMentionItem[]>;

/** Uploads an image file and resolves with the URL to put in the text. */
export type TxEditorImageUpload = (file: File) => Promise<string>;

/** An image that was not inserted, with the reason. */
export interface TxEditorImageRejection {
  /** The rejected file. */
  file: File;
  /** `type` when the file is not an image, `size` when it is larger than `maxImageSize`. */
  reason: 'type' | 'size';
  /** Text to show the user: the file name for a wrong type, a "too large" message for a size. */
  message: string;
}

/** The selection of the editor, as emitted by `selectionChange`. */
export interface TxEditorSelection {
  /** Start position in the document. */
  from: number;
  /** End position in the document. */
  to: number;
  /** `true` for a caret without selected text. */
  empty: boolean;
  /** The selected plain text. */
  text: string;
}

/** The text after a change, as emitted by `textChange`. */
export interface TxEditorTextChange {
  /** The content as HTML. */
  html: string;
  /** The content as plain text. */
  text: string;
}

/** An AI action offered on the selected text. */
export interface TxEditorAiAction {
  /** Identifier you read back in the request. */
  id: string;
  /** Text of the menu item. */
  label: string;
  /** Icon of the menu item; `sparkles` by default. */
  icon?: string;
}

/** An AI action the user picked, emitted by `aiAction` with the selected text. */
export interface TxEditorAiRequest {
  /** The action that was picked. */
  action: TxEditorAiAction;
  /** The selected plain text. */
  text: string;
  /** The selected content as HTML. */
  html: string;
  /**
   * Replaces the selection with the answer; pass a string, or an async stream of chunks that is written as it arrives.
   */
  replace: (content: string | AsyncIterable<string>) => Promise<void>;
}
