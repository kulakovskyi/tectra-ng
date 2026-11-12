import { NgTemplateOutlet } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TxAnnouncer, uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxFormControlBase, injectFieldInvalid } from '@tectra-ng/core/forms';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraFileUploadTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxFileUploadActions, TxFileUploadDropzoneTemplate, TxFileUploadFileTemplate } from './file-upload.templates';
import {
  TxFileKind,
  TxFileRejection,
  TxFileUploadBeforeUploadEvent,
  TxFileUploadEntry,
  TxFileUploadErrorEvent,
  TxFileUploadEvent,
  TxFileUploadFileContext,
  TxFileUploadHandlerEvent,
  TxFileUploadMessage,
  TxFileUploadMethod,
  TxFileUploadMode,
  TxFileUploadPart,
  TxFileUploadProgressEvent,
  TxFileUploadRemoveEvent,
  TxFileUploadSelectEvent,
  TxFileUploadedRemoveEvent,
} from './file-upload.types';
import { acceptLabel, fileExtension, fileKind, fileMatchesAccept, fileSizeParts, sameFile } from './file-upload.utils';
import { FILE_UPLOAD_ICON_DEFAULTS } from './file-upload.icons';

const KIND_ICONS: Record<TxFileKind, TxIconName> = {
  image: 'image',
  pdf: 'file',
  sheet: 'file',
  document: 'file',
  archive: 'file',
  media: 'video',
  other: 'file',
};

type TxFileUploadValue = File | File[];

@Component({
  selector: 'tx-file-upload',
  imports: [NgTemplateOutlet, TxIcon, TxButton],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TxFileUpload), multi: true }],
  host: {
    class: 'tx-file-upload',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-mode]': 'mode()',
    '[class.tx-file-upload--disabled]': 'isDisabled()',
    '[class.tx-file-upload--invalid]': 'isInvalid()',
    '[class.tx-file-upload--dragging]': 'dragging()',
    '[class.tx-file-upload--filled]': 'rows().length > 0',
  },
  viewProviders: [provideTxIconDefaults(FILE_UPLOAD_ICON_DEFAULTS)],
})
export class TxFileUpload extends TxFormControlBase<TxFileUploadValue> {
  private document = inject(DOCUMENT);
  private http = inject(HttpClient, { optional: true });
  private announcer = inject(TxAnnouncer);
  private localeService = inject(TxLocaleService);
  private field = inject(TxField, { optional: true });

  readonly mode = input<TxFileUploadMode>('advanced');
  readonly files = model<File[]>([]);
  readonly file = model<File | null>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly accept = input<string | undefined>(undefined);
  readonly maxFileSize = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly fileLimit = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly auto = input(false, { transform: booleanAttribute });
  readonly url = input<string | undefined>(undefined);
  readonly name = input('files');
  readonly method = input<TxFileUploadMethod>('post');
  readonly headers = input<HttpHeaders | Record<string, string> | undefined>(undefined);
  readonly withCredentials = input(false, { transform: booleanAttribute });
  readonly customUpload = input(false, { transform: booleanAttribute });
  readonly description = input<string | undefined>(undefined);
  readonly chooseLabel = input<string | undefined>(undefined);
  readonly uploadLabel = input<string | undefined>(undefined);
  readonly cancelLabel = input<string | undefined>(undefined);
  readonly chooseIcon = input<TxIconName | (string & {})>('plus');
  readonly uploadIcon = input<TxIconName | (string & {})>('upload');
  readonly cancelIcon = input<TxIconName | (string & {})>('times');
  readonly showUploadButton = input(true, { transform: booleanAttribute });
  readonly showCancelButton = input(true, { transform: booleanAttribute });
  readonly showMessages = input(true, { transform: booleanAttribute });
  readonly invalidFileTypeMessage = input<string | undefined>(undefined);
  readonly invalidFileSizeMessage = input<string | undefined>(undefined);
  readonly invalidFileLimitMessage = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraFileUploadTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFileUploadPart, TxFileUpload> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly selected = output<TxFileUploadSelectEvent>();
  readonly removed = output<TxFileUploadRemoveEvent>();
  readonly cleared = output<void>();
  readonly rejected = output<TxFileRejection[]>();
  readonly beforeUpload = output<TxFileUploadBeforeUploadEvent>();
  readonly uploadProgress = output<TxFileUploadProgressEvent>();
  readonly uploaded = output<TxFileUploadEvent>();
  readonly uploadFailed = output<TxFileUploadErrorEvent>();
  readonly uploadHandler = output<TxFileUploadHandlerEvent>();
  readonly uploadedFileRemoved = output<TxFileUploadedRemoveEvent>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly isInvalid = injectFieldInvalid(this.invalid);
  readonly passThrough = injectPassThrough('fileUpload', this, this.pt, this.ptOptions);
  protected readonly fileTemplate = contentChild(TxFileUploadFileTemplate);
  protected readonly dropzoneTemplate = contentChild(TxFileUploadDropzoneTemplate);
  protected readonly actions = contentChild(TxFileUploadActions);
  private readonly inputElement = viewChild<ElementRef<HTMLInputElement>>('input');

  protected readonly id = uniqueId('tx-file-upload');
  readonly entries = signal<TxFileUploadEntry[]>([]);
  readonly uploadedEntries = signal<TxFileUploadEntry[]>([]);
  protected readonly messages = signal<TxFileUploadMessage[]>([]);
  protected readonly dragging = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.disabledInput());
  readonly uploading = computed(() => this.entries().some((entry) => entry.status === 'uploading'));
  protected readonly rows = computed(() => [...this.entries(), ...this.uploadedEntries()].sort((a, b) => (this.order.get(a.id) ?? 0) - (this.order.get(b.id) ?? 0)));
  protected readonly current = computed(() => this.entries()[0] ?? this.uploadedEntries().at(-1) ?? null);
  protected readonly hasTarget = computed(() => !!this.url() || this.customUpload());
  protected readonly waiting = computed(() => this.entries().filter((entry) => entry.status === 'pending' || entry.status === 'failed'));
  protected readonly limitReached = computed(() => {
    const limit = this.fileLimit();
    return this.multiple() && limit !== undefined && this.entries().length + this.uploadedEntries().length >= limit;
  });
  protected readonly showFooter = computed(
    () => this.mode() === 'advanced' && (!!this.actions() || (this.hasTarget() && !this.auto() && this.showUploadButton() && this.waiting().length > 0)),
  );
  protected readonly prompt = computed(() => {
    const t = this.translations();
    const [before, after = ''] = (this.multiple() ? t.fileUploadPrompt : t.fileUploadPromptSingle).split('{browse}');
    return { before, link: this.chooseLabel() ?? t.fileUploadBrowse, after };
  });
  protected readonly summary = computed(() => {
    const waiting = this.waiting();
    const size = this.formatSize(waiting.reduce((sum, entry) => sum + entry.file.size, 0));
    return this.translations().filesSummary.replace('{count}', String(waiting.length)).replace('{size}', size);
  });
  protected readonly basicLabel = computed(() => {
    const entries = this.rows();
    const t = this.translations();
    if (!entries.length) {
      return t.noFileChosen;
    }
    return entries.length === 1 ? entries[0].file.name : t.filesChosen.replace('{count}', String(entries.length));
  });
  protected readonly zoneLabelledBy = computed(() => {
    if (this.ariaLabel()) {
      return null;
    }
    const own = !this.multiple() && this.current() ? `${this.id}-prompt` : `${this.id}-content`;
    return [this.field?.label() ? this.field.labelId : null, own].filter(Boolean).join(' ');
  });
  protected readonly chooseText = computed(() => this.chooseLabel() ?? (this.multiple() ? this.translations().chooseFiles : this.translations().chooseFile));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-file-upload'), ...this.passThrough().root?.style }));

  protected readonly chooseFiles = (): void => this.choose();

  private readonly order = new Map<string, number>();
  private dragDepth = 0;
  private messageId = 0;
  private abort: (() => void) | null = null;

  constructor() {
    super();
    effect(() => {
      const files = this.files();
      untracked(() => this.adopt(files));
    });
    effect(() => {
      const file = this.file();
      untracked(() => {
        if (!this.multiple() && (this.files()[0] ?? null) !== file) {
          this.files.set(file ? [file] : []);
        }
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.abort?.();
      [...this.entries(), ...this.uploadedEntries()].forEach((entry) => this.revoke(entry));
    });
  }

  override writeValue(value: TxFileUploadValue | null): void {
    super.writeValue(value);
    const files = value === null || value === undefined ? [] : Array.isArray(value) ? value : [value];
    this.files.set(files);
    this.file.set(this.multiple() ? null : (files[0] ?? null));
  }

  choose(): void {
    if (!this.isDisabled()) {
      this.inputElement()?.nativeElement.click();
    }
  }

  upload(): void {
    const waiting = this.waiting();
    if (!waiting.length || this.uploading()) {
      return;
    }
    const ids = new Set(waiting.map((entry) => entry.id));
    this.patch(ids, { status: 'uploading', progress: 0, error: null });
    const files = waiting.map((entry) => entry.file);
    if (this.customUpload()) {
      this.uploadHandler.emit({
        files,
        progress: (value, file) => this.patch(this.idsOf(ids, file), { progress: this.clampProgress(value) }),
        complete: (file) => this.finish(this.idsOf(ids, file), null),
        fail: (message, file) => this.fail(this.idsOf(ids, file), message ?? this.translations().fileFailed, null),
      });
      return;
    }
    const url = this.url();
    if (url) {
      this.send(url, ids, files);
    }
  }

  clear(): void {
    this.abort?.();
    this.abort = null;
    this.entries().forEach((entry) => this.revoke(entry));
    this.entries.set([]);
    this.messages.set([]);
    this.commit();
    this.cleared.emit();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []), event);
    input.value = '';
    this.markTouched();
  }

  protected onZoneClick(event: MouseEvent): void {
    if (!this.fromSelectedCard(event)) {
      this.choose();
    }
  }

  protected onZoneKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || this.fromSelectedCard(event)) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.choose();
    }
  }

  protected onDragEnter(event: DragEvent): void {
    if (!this.acceptsDrag(event)) {
      return;
    }
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.acceptsDrag(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  protected onDragLeave(event: DragEvent): void {
    if (!this.dragging()) {
      return;
    }
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.dragging.set(false);
    }
  }

  protected onDrop(event: DragEvent): void {
    this.dragDepth = 0;
    this.dragging.set(false);
    if (this.isDisabled()) {
      return;
    }
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) {
      this.add(files, event);
      this.markTouched();
    }
  }

  protected remove(event: Event, entry: TxFileUploadEntry): void {
    this.revoke(entry);
    if (this.uploadedEntries().includes(entry)) {
      this.uploadedEntries.update((entries) => entries.filter((item) => item !== entry));
      this.uploadedFileRemoved.emit({ file: entry.file, files: this.uploadedEntries().map((item) => item.file) });
      return;
    }
    this.entries.update((entries) => entries.filter((item) => item !== entry));
    this.messages.update((messages) => messages.filter((message) => !this.isLimitMessage(message)));
    this.commit();
    this.removed.emit({ originalEvent: event, file: entry.file });
  }

  protected retry(entry: TxFileUploadEntry): void {
    this.patch(new Set([entry.id]), { status: 'pending', progress: 0, error: null });
    this.upload();
  }

  protected dismiss(message: TxFileUploadMessage): void {
    this.messages.update((messages) => messages.filter((item) => item !== message));
  }

  protected fileContext(entry: TxFileUploadEntry, index: number): TxFileUploadFileContext {
    return { $implicit: entry, index, remove: (event: Event) => this.remove(event, entry) };
  }

  protected kindIcon(kind: TxFileKind): TxIconName {
    return KIND_ICONS[kind];
  }

  protected meta(entry: TxFileUploadEntry): string {
    const t = this.translations();
    const size = this.formatSize(entry.file.size);
    switch (entry.status) {
      case 'uploading':
        return `${size} · ${t.fileUploading.replace('{progress}', String(Math.round(entry.progress)))}`;
      case 'uploaded':
        return `${size} · ${t.fileUploaded}`;
      case 'failed':
        return `${size} · ${entry.error ?? t.fileFailed}`;
      default:
        return this.hasTarget() && !this.auto() ? `${size} · ${t.fileReady}` : size;
    }
  }

  protected removeLabel(entry: TxFileUploadEntry): string {
    return this.translations().removeItem.replace('{item}', entry.file.name);
  }

  formatSize(bytes: number): string {
    const { value, unit } = fileSizeParts(bytes);
    return this.localeService.formatNumber(value, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: unit === 'byte' ? 0 : 1 });
  }

  private add(files: File[], event: Event): void {
    if (this.isDisabled() || !files.length) {
      return;
    }
    const multiple = this.multiple();
    const candidates = multiple ? files : files.slice(0, 1);
    const kept = multiple ? this.entries() : [];
    const limit = this.fileLimit();
    const room = multiple && limit !== undefined ? Math.max(0, limit - kept.length - this.uploadedEntries().length) : Infinity;
    const accepted: File[] = [];
    const rejections: TxFileRejection[] = [];
    for (const file of candidates) {
      if ([...kept.map((entry) => entry.file), ...accepted].some((other) => sameFile(other, file))) {
        continue;
      }
      const reason = this.validate(file);
      if (reason) {
        rejections.push({ file, reason, message: this.rejectionText(reason, file) });
      } else if (accepted.length >= room) {
        rejections.push({ file, reason: 'limit', message: this.rejectionText('limit', file) });
      } else {
        accepted.push(file);
      }
    }
    const limitMessages = rejections.filter((rejection) => rejection.reason === 'limit').slice(0, 1);
    const shown = [...rejections.filter((rejection) => rejection.reason !== 'limit'), ...limitMessages];
    this.messages.set(this.showMessages() ? shown.map((rejection) => ({ id: ++this.messageId, text: rejection.message })) : []);
    if (rejections.length) {
      this.rejected.emit(rejections);
      this.announcer.announce(shown.map((rejection) => rejection.message).join('. '), 'assertive');
    }
    if (!accepted.length) {
      return;
    }
    if (!multiple) {
      this.entries().forEach((entry) => this.revoke(entry));
    }
    this.entries.set([...kept, ...accepted.map((file) => this.toEntry(file))]);
    this.commit();
    this.selected.emit({ originalEvent: event, files: accepted, currentFiles: this.files() });
    this.announcer.announce(this.translations().filesAdded.replace('{names}', accepted.map((file) => file.name).join(', ')));
    if (this.auto() && this.hasTarget()) {
      this.upload();
    }
  }

  private validate(file: File): 'type' | 'size' | null {
    if (!fileMatchesAccept(file, this.accept())) {
      return 'type';
    }
    const max = this.maxFileSize();
    return max !== undefined && max > 0 && file.size > max ? 'size' : null;
  }

  private rejectionText(reason: 'type' | 'size' | 'limit', file: File): string {
    const t = this.translations();
    const template = {
      type: this.invalidFileTypeMessage() ?? t.invalidFileType,
      size: this.invalidFileSizeMessage() ?? t.invalidFileSize,
      limit: this.invalidFileLimitMessage() ?? t.invalidFileLimit,
    }[reason];
    return template
      .replace('{name}', file.name)
      .replace('{types}', acceptLabel(this.accept()))
      .replace('{size}', this.formatSize(this.maxFileSize() ?? 0))
      .replace('{limit}', String(this.fileLimit() ?? ''));
  }

  private isLimitMessage(message: TxFileUploadMessage): boolean {
    const limit = String(this.fileLimit() ?? '');
    return message.text === (this.invalidFileLimitMessage() ?? this.translations().invalidFileLimit).replace('{limit}', limit);
  }

  private adopt(files: File[]): void {
    const entries = this.entries();
    if (files.length === entries.length && files.every((file, index) => file === entries[index].file)) {
      return;
    }
    const next = files.map((file) => entries.find((entry) => entry.file === file) ?? this.toEntry(file));
    entries.filter((entry) => !next.includes(entry)).forEach((entry) => this.revoke(entry));
    this.entries.set(next);
  }

  private commit(): void {
    const files = this.entries().map((entry) => entry.file);
    this.files.set(files);
    const single = files[0] ?? null;
    if (!this.multiple()) {
      this.file.set(single);
    }
    this.updateValue(this.multiple() ? files : single);
  }

  private toEntry(file: File): TxFileUploadEntry {
    const kind = fileKind(file);
    const view = this.document.defaultView as (Window & typeof globalThis) | null;
    const preview = kind === 'image' && view?.URL?.createObjectURL ? view.URL.createObjectURL(file) : null;
    const id = uniqueId('tx-file');
    this.order.set(id, this.order.size);
    return { id, file, kind, extension: fileExtension(file), preview, status: 'pending', progress: 0, error: null };
  }

  private revoke(entry: TxFileUploadEntry): void {
    this.order.delete(entry.id);
    if (entry.preview) {
      (this.document.defaultView as (Window & typeof globalThis) | null)?.URL?.revokeObjectURL?.(entry.preview);
    }
  }

  private patch(ids: ReadonlySet<string>, changes: Partial<TxFileUploadEntry>): void {
    this.entries.update((entries) => entries.map((entry) => (ids.has(entry.id) ? { ...entry, ...changes } : entry)));
    if (changes.progress !== undefined && changes.status === undefined) {
      this.uploadProgress.emit({ progress: changes.progress });
    }
  }

  private idsOf(ids: ReadonlySet<string>, file: File | undefined): ReadonlySet<string> {
    if (!file) {
      return ids;
    }
    const entry = this.entries().find((item) => item.file === file && ids.has(item.id));
    return new Set(entry ? [entry.id] : []);
  }

  private finish(ids: ReadonlySet<string>, originalEvent: unknown): void {
    const done = this.entries().filter((entry) => ids.has(entry.id) && entry.status === 'uploading');
    if (!done.length) {
      return;
    }
    this.entries.update((entries) => entries.filter((entry) => !done.includes(entry)));
    this.uploadedEntries.update((entries) => [...entries, ...done.map((entry) => ({ ...entry, status: 'uploaded' as const, progress: 100 }))]);
    this.commit();
    const files = done.map((entry) => entry.file);
    this.uploaded.emit({ originalEvent, files });
    this.announcer.announce(this.translations().filesUploaded);
  }

  private fail(ids: ReadonlySet<string>, message: string, error: unknown): void {
    const failed = this.entries().filter((entry) => ids.has(entry.id) && entry.status === 'uploading');
    if (!failed.length) {
      return;
    }
    this.patch(new Set(failed.map((entry) => entry.id)), { status: 'failed', error: message });
    this.uploadFailed.emit({ files: failed.map((entry) => entry.file), error });
    this.announcer.announce(message, 'assertive');
  }

  private send(url: string, ids: ReadonlySet<string>, files: File[]): void {
    const formData = new FormData();
    this.beforeUpload.emit({ formData });
    files.forEach((file) => formData.append(this.name(), file, file.name));
    const failText = this.translations().fileFailed;
    if (this.http) {
      const headers = this.headers();
      const subscription = this.http
        .request(this.method().toUpperCase(), url, {
          body: formData,
          headers: headers instanceof HttpHeaders ? headers : new HttpHeaders(headers ?? {}),
          reportProgress: true,
          observe: 'events',
          withCredentials: this.withCredentials(),
        })
        .subscribe({
          next: (event: HttpEvent<unknown>) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.patch(ids, { progress: this.clampProgress((event.loaded * 100) / event.total) });
            } else if (event.type === HttpEventType.Response) {
              this.abort = null;
              if (event.ok) {
                this.finish(ids, event);
              } else {
                this.fail(ids, failText, event);
              }
            }
          },
          error: (error: unknown) => {
            this.abort = null;
            this.fail(ids, failText, error);
          },
        });
      this.abort = () => subscription.unsubscribe();
      return;
    }
    const request = new XMLHttpRequest();
    request.open(this.method().toUpperCase(), url);
    request.withCredentials = this.withCredentials();
    const headers = this.headers();
    if (headers instanceof HttpHeaders) {
      headers.keys().forEach((key) => request.setRequestHeader(key, headers.get(key) ?? ''));
    } else {
      Object.entries(headers ?? {}).forEach(([key, value]) => request.setRequestHeader(key, value));
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        this.patch(ids, { progress: this.clampProgress((event.loaded * 100) / event.total) });
      }
    };
    request.onload = () => {
      this.abort = null;
      if (request.status >= 200 && request.status < 300) {
        this.finish(ids, request);
      } else {
        this.fail(ids, failText, request);
      }
    };
    request.onerror = () => {
      this.abort = null;
      this.fail(ids, failText, request);
    };
    request.send(formData);
    this.abort = () => request.abort();
  }

  private clampProgress(value: number): number {
    return Math.round(Math.min(100, Math.max(0, value)));
  }

  private fromSelectedCard(event: Event): boolean {
    const target = event.target as Element | null;
    return (!this.multiple() && this.current() !== null) || !!target?.closest?.('.tx-file-upload__selected');
  }

  private acceptsDrag(event: DragEvent): boolean {
    return !this.isDisabled() && !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');
  }
}
