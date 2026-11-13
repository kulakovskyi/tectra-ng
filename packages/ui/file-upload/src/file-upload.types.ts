/** `advanced` shows a drop zone and a file list; `basic` is a single button. */
export type TxFileUploadMode = 'advanced' | 'basic';

/** HTTP method of the built-in upload request. */
export type TxFileUploadMethod = 'post' | 'put';

/** Group a file belongs to, chosen from its type and extension; picks the thumbnail icon. */
export type TxFileKind = 'image' | 'pdf' | 'sheet' | 'document' | 'archive' | 'media' | 'other';

/** Upload state of a file: waiting, being sent, sent or failed. */
export type TxFileStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

/** Why a file was not added: wrong type, too big or over the file limit. */
export type TxFileRejectReason = 'type' | 'size' | 'limit';

/** Parts of `tx-file-upload` that `pt` can style. */
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

/** One file in the list of `tx-file-upload` with its preview, status and progress. */
export interface TxFileUploadEntry {
  /** Unique id of the entry inside the component. */
  id: string;
  /** The picked file. */
  file: File;
  /** Group of the file, used for its icon. */
  kind: TxFileKind;
  /** Lower-case file extension without the dot; empty when the name has none. */
  extension: string;
  /** Object URL of an image preview; `null` for files that are not images. */
  preview: string | null;
  /** Current upload state. */
  status: TxFileStatus;
  /** Upload progress in percent, 0 to 100. */
  progress: number;
  /** Message of the last failure; `null` when there is none. */
  error: string | null;
}

/** A file that was not added and the reason. */
export interface TxFileRejection {
  /** The rejected file. */
  file: File;
  /** Which rule the file broke. */
  reason: TxFileRejectReason;
  /** Translated text that explains the rejection. */
  message: string;
}

/** Event of `selected`: files were added by choosing or dropping them. */
export interface TxFileUploadSelectEvent {
  /** Browser event that brought the files: a change or a drop. */
  originalEvent: Event;
  /** Files that were accepted in this selection. */
  files: File[];
  /** All files in the component after the selection. */
  currentFiles: File[];
}

/** Event of `removed`: a file was taken out of the list. */
export interface TxFileUploadRemoveEvent {
  /** Browser event of the remove click. */
  originalEvent: Event;
  /** The removed file. */
  file: File;
}

/** Event of `beforeUpload`: lets you change the request body before it is sent. */
export interface TxFileUploadBeforeUploadEvent {
  /** Form data that will be sent; append your own fields to it. */
  formData: FormData;
}

/** Event of `uploadProgress`. */
export interface TxFileUploadProgressEvent {
  /** Upload progress in percent, 0 to 100. */
  progress: number;
}

/** Event of `uploaded`: files were sent successfully. */
export interface TxFileUploadEvent {
  /** The request or its load event; `null` when your `uploadHandler` completed the upload. */
  originalEvent: unknown;
  /** Files that were uploaded. */
  files: File[];
}

/** Event of `uploadFailed`: files could not be sent. */
export interface TxFileUploadErrorEvent {
  /** Files that failed. */
  files: File[];
  /** Error or message that describes the failure. */
  error: unknown;
}

/** Event of `uploadHandler`: you upload the files yourself and report back through its callbacks. */
export interface TxFileUploadHandlerEvent {
  /** Files to upload. */
  files: File[];
  /** Reports progress in percent for all files, or for one file. */
  progress: (value: number, file?: File) => void;
  /** Marks all files, or one file, as uploaded. */
  complete: (file?: File) => void;
  /** Marks all files, or one file, as failed, with an optional message. */
  fail: (message?: string, file?: File) => void;
}

/** Event of `uploadedFileRemoved`: an already uploaded file was removed. */
export interface TxFileUploadedRemoveEvent {
  /** The removed file. */
  file: File;
  /** Uploaded files that remain. */
  files: File[];
}

/** A rejection message shown under the drop zone. */
export interface TxFileUploadMessage {
  /** Unique id of the message. */
  id: number;
  /** Text of the message. */
  text: string;
}

/** Context of a `txFileUploadFile` template: one file row. */
export interface TxFileUploadFileContext {
  /** Entry the row shows. */
  $implicit: TxFileUploadEntry;
  /** Position of the entry in the list. */
  index: number;
  /** Removes the file; pass it the click event. */
  remove: (event: Event) => void;
}

/** Context of a `txFileUploadDropzone` template: the drop zone content. */
export interface TxFileUploadDropzoneContext {
  /** `true` while files are dragged over the zone. */
  $implicit: boolean;
  /** Opens the file picker. */
  choose: () => void;
}
