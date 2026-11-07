export type TxFileUploadMode = 'advanced' | 'basic';

export type TxFileUploadMethod = 'post' | 'put';

export type TxFileKind = 'image' | 'pdf' | 'sheet' | 'document' | 'archive' | 'media' | 'other';

export type TxFileStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export type TxFileRejectReason = 'type' | 'size' | 'limit';

export type TxFileUploadPart =
  | 'root'
  | 'dropzone'
  | 'icon'
  | 'prompt'
  | 'hint'
  | 'list'
  | 'file'
  | 'thumbnail'
  | 'fileName'
  | 'fileMeta'
  | 'progress'
  | 'message'
  | 'footer'
  | 'basic';

export interface TxFileUploadEntry {
  id: string;
  file: File;
  kind: TxFileKind;
  extension: string;
  preview: string | null;
  status: TxFileStatus;
  progress: number;
  error: string | null;
}

export interface TxFileRejection {
  file: File;
  reason: TxFileRejectReason;
  message: string;
}

export interface TxFileUploadSelectEvent {
  originalEvent: Event;
  files: File[];
  currentFiles: File[];
}

export interface TxFileUploadRemoveEvent {
  originalEvent: Event;
  file: File;
}

export interface TxFileUploadBeforeUploadEvent {
  formData: FormData;
}

export interface TxFileUploadProgressEvent {
  progress: number;
}

export interface TxFileUploadEvent {
  originalEvent: unknown;
  files: File[];
}

export interface TxFileUploadErrorEvent {
  files: File[];
  error: unknown;
}

export interface TxFileUploadHandlerEvent {
  files: File[];
  progress: (value: number, file?: File) => void;
  complete: (file?: File) => void;
  fail: (message?: string, file?: File) => void;
}

export interface TxFileUploadedRemoveEvent {
  file: File;
  files: File[];
}

export interface TxFileUploadMessage {
  id: number;
  text: string;
}

export interface TxFileUploadFileContext {
  $implicit: TxFileUploadEntry;
  index: number;
  remove: (event: Event) => void;
}

export interface TxFileUploadDropzoneContext {
  $implicit: boolean;
  choose: () => void;
}
