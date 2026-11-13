/** Markup of the saved text: clean `html` or Quill 2 markup (`quill`). */
export type TxEditorFormat = 'html' | 'quill';

/** Parts of `tx-editor-content` that `pt` can style. */
export type TxEditorContentPart = 'root' | 'body';

/** An image of `tx-editor-content` was clicked. */
export interface TxEditorImageClickEvent {
  /** The click or key press that triggered it. */
  originalEvent: MouseEvent | KeyboardEvent;
  /** Address of the image. */
  src: string;
  /** Alternative text of the image. */
  alt: string;
}
