export type TxEditorFormat = 'html' | 'quill';

export type TxEditorContentPart = 'root' | 'body';

export interface TxEditorImageClickEvent {
  originalEvent: MouseEvent | KeyboardEvent;
  src: string;
  alt: string;
}
