import { HttpClient, HttpEventType, HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxFileUpload } from './file-upload.component';
import { TxFileUploadActions, TxFileUploadDropzoneTemplate, TxFileUploadFileTemplate } from './file-upload.templates';
import {
  TxFileRejection,
  TxFileUploadDropzoneContext,
  TxFileUploadErrorEvent,
  TxFileUploadEvent,
  TxFileUploadFileContext,
  TxFileUploadHandlerEvent,
  TxFileUploadSelectEvent,
  TxFileUploadedRemoveEvent,
} from './file-upload.types';
import { acceptLabel, fileKind, fileMatchesAccept, fileSizeParts } from './file-upload.utils';

const csv = (name = 'report.csv', size = 1536) => new File(['x'.repeat(size)], name, { type: 'text/csv', lastModified: 1 });
const png = (name = 'photo.png') => new File(['png'], name, { type: 'image/png', lastModified: 1 });

function pick(input: HTMLInputElement, files: File[] | null): void {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  input.dispatchEvent(new Event('change'));
}

function drag(target: HTMLElement, type: string, files: File[] = [], types = ['Files']): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { types, files, dropEffect: 'none' } });
  target.dispatchEvent(event);
  return event;
}

@Component({
  imports: [TxFileUpload, TxFileUploadActions],
  template: `
    <tx-file-upload
      multiple
      accept=".csv,image/*"
      [maxFileSize]="4096"
      [fileLimit]="3"
      [customUpload]="true"
      description="CSV or images, up to 4 KB"
      [disabled]="disabled()"
      [dt]="{ dropzone: { minHeight: '120px' } }"
      [pt]="{ file: { class: 'own-file' } }"
      [(files)]="files"
      (selected)="selections.push($event)"
      (rejected)="rejections.push($event)"
      (uploadHandler)="handlers.push($event)"
      (uploaded)="uploads.push($event)"
    >
      <span txFileUploadActions class="own-action">Template</span>
    </tx-file-upload>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MultipleHost {
  readonly upload = viewChild.required(TxFileUpload);
  readonly disabled = signal(false);
  readonly files = signal<File[]>([]);
  readonly selections: TxFileUploadSelectEvent[] = [];
  readonly rejections: TxFileRejection[][] = [];
  readonly handlers: TxFileUploadHandlerEvent[] = [];
  readonly uploads: TxFileUploadEvent[] = [];
}

@Component({
  imports: [TxFileUpload, ReactiveFormsModule],
  template: `<tx-file-upload accept=".csv" [formControl]="control" [(file)]="file" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SingleHost {
  readonly control = new FormControl<File | null>(null);
  readonly file = signal<File | null>(null);
}

@Component({
  imports: [TxFileUpload],
  template: `<tx-file-upload url="/api/files" name="attachment" auto [headers]="{ 'X-Token': 'test' }" (uploaded)="done = $event.files" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class UrlHost {
  done: File[] = [];
}

@Component({
  imports: [TxFileUpload, TxFileUploadFileTemplate, TxFileUploadDropzoneTemplate],
  template: `
    <tx-file-upload mode="basic" unstyled />
    <tx-file-upload id="own" multiple>
      <ng-template txFileUploadDropzone let-dragging let-choose="choose">
        <b class="own-zone">{{ dragging ? 'Drop' : 'Pick' }}</b>
      </ng-template>
      <ng-template txFileUploadFile let-entry let-remove="remove">
        <button type="button" class="own-row" (click)="remove($event)">{{ entry.file.name }}</button>
      </ng-template>
    </tx-file-upload>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {}

describe('file upload utils', () => {
  it('matches accept rules by extension, wildcard and MIME type', () => {
    expect(fileMatchesAccept(csv(), '.csv')).toBe(true);
    expect(fileMatchesAccept(png(), 'image/*')).toBe(true);
    expect(fileMatchesAccept(png(), 'image/png, .csv')).toBe(true);
    expect(fileMatchesAccept(png(), '.csv,application/pdf')).toBe(false);
    expect(fileMatchesAccept(png(), '')).toBe(true);
  });

  it('sorts files into kinds and sizes into units', () => {
    expect(fileKind(png())).toBe('image');
    expect(fileKind(csv())).toBe('sheet');
    expect(fileKind(new File([''], 'a.pdf', { type: 'application/pdf' }))).toBe('pdf');
    expect(fileKind(new File([''], 'a.zip'))).toBe('archive');
    expect(fileKind(new File([''], 'notes'))).toBe('other');
    expect(acceptLabel('image/png, image/jpeg,.pdf,application/vnd.ms-excel,image/*')).toBe('PNG, JPEG, PDF, EXCEL, image/*');
    expect(fileSizeParts(512)).toEqual({ value: 512, unit: 'byte' });
    expect(fileSizeParts(1536)).toEqual({ value: 1.5, unit: 'kilobyte' });
    expect(fileSizeParts(5 * 1024 * 1024)).toEqual({ value: 5, unit: 'megabyte' });
  });
});

describe('TxFileUpload multiple', () => {
  let fixture: ComponentFixture<MultipleHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const input = () => el('.tx-file-upload__input') as HTMLInputElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MultipleHost);
    await fixture.whenStable();
  });

  it('renders the drop zone as a described button that opens the file dialog', () => {
    const zone = el('.tx-file-upload__zone');
    const click = vi.spyOn(input(), 'click');
    expect(zone.getAttribute('role')).toBe('button');
    expect(zone.getAttribute('tabindex')).toBe('0');
    expect(el('#' + zone.getAttribute('aria-labelledby')).classList).toContain('tx-file-upload__content');
    expect(zone.textContent?.replace(/\s+/g, ' ').trim()).toBe('Drop files here or browse CSV or images, up to 4 KB');
    expect(input().multiple).toBe(true);
    expect(input().accept).toBe('.csv,image/*');
    zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    zone.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    zone.click();
    expect(click).toHaveBeenCalledTimes(3);
    expect(el('tx-file-upload').style.getPropertyValue('--tx-file-upload-dropzone-min-height')).toBe('120px');
  });

  it('lists picked files with kinds, sizes and the two-way files', async () => {
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    const rows = all('.tx-file-upload__file');
    expect(rows).toHaveLength(2);
    expect(rows[0].classList).toContain('own-file');
    expect(rows[0].querySelector('.tx-file-upload__name')?.textContent).toBe('report.csv');
    expect(rows[0].querySelector('.tx-file-upload__meta')?.textContent).toContain('1.5 kB');
    expect(rows[0].querySelector('.tx-file-upload__meta')?.textContent).toContain('Ready to upload');
    expect(rows[0].querySelector('.tx-file-upload__thumbnail')?.getAttribute('data-kind')).toBe('sheet');
    expect(rows[0].querySelector('.tx-file-upload__extension')?.textContent).toBe('csv');
    expect(rows[1].querySelector('.tx-file-upload__thumbnail')?.getAttribute('data-kind')).toBe('image');
    expect(fixture.componentInstance.files().map((file) => file.name)).toEqual(['report.csv', 'photo.png']);
    expect(fixture.componentInstance.selections[0].files).toHaveLength(2);
    expect(el('.tx-file-upload__summary').textContent).toContain('Files: 2');
  });

  it('rejects wrong types, big files, duplicates and files over the limit', async () => {
    pick(input(), [csv()]);
    pick(input(), [csv(), new File(['x'], 'notes.txt', { type: 'text/plain' }), csv('big.csv', 5000), png('a.png'), png('b.png'), png('c.png')]);
    await fixture.whenStable();
    const reasons = fixture.componentInstance.rejections[0].map((rejection) => `${rejection.file.name}:${rejection.reason}`);
    expect(reasons).toEqual(['notes.txt:type', 'big.csv:size', 'c.png:limit']);
    const texts = all('.tx-file-upload__message-text').map((message) => message.textContent);
    expect(texts).toEqual(['notes.txt is not a supported file type (CSV, image/*)', 'big.csv is larger than 4 kB', 'You can add up to 3 files']);
    expect(fixture.componentInstance.files()).toHaveLength(3);
    expect(el('.tx-file-upload__zone').getAttribute('aria-disabled')).toBe('true');
    (all('.tx-file-upload__dismiss')[0] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(all('.tx-file-upload__message')).toHaveLength(2);
  });

  it('removes a file with its named button', async () => {
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    const remove = el('.tx-file-upload__remove') as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Remove report.csv');
    remove.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.files().map((file) => file.name)).toEqual(['photo.png']);
  });

  it('highlights while files are dragged over and adds dropped files', async () => {
    const zone = el('.tx-file-upload__zone');
    drag(zone, 'dragenter');
    expect(drag(zone, 'dragover').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(el('tx-file-upload').classList).toContain('tx-file-upload--dragging');
    expect(el('.tx-file-upload__prompt').textContent?.trim()).toBe('Release to add');
    drag(zone, 'drop', [csv()]);
    await fixture.whenStable();
    expect(el('tx-file-upload').classList).not.toContain('tx-file-upload--dragging');
    expect(fixture.componentInstance.files()).toHaveLength(1);
  });

  it('hands the files to a custom upload with progress, failure, retry and completion', async () => {
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    (all('.tx-file-upload__footer-buttons button').at(-1) as HTMLButtonElement).click();
    await fixture.whenStable();
    const handler = fixture.componentInstance.handlers[0];
    expect(handler.files.map((file) => file.name)).toEqual(['report.csv', 'photo.png']);
    handler.progress(42.4);
    await fixture.whenStable();
    expect(all('.tx-file-upload__progress').map((bar) => bar.getAttribute('aria-valuenow'))).toEqual(['42', '42']);
    expect(el('.tx-file-upload__meta').textContent).toContain('Uploading 42%');
    handler.fail('Server is busy', handler.files[1]);
    handler.complete(handler.files[0]);
    await fixture.whenStable();
    const rows = all('.tx-file-upload__file');
    expect(rows.map((row) => row.getAttribute('data-status'))).toEqual(['uploaded', 'failed']);
    expect(rows[0].textContent).toContain('Uploaded');
    expect(rows[1].textContent).toContain('Server is busy');
    expect(fixture.componentInstance.uploads[0].files.map((file) => file.name)).toEqual(['report.csv']);
    expect(fixture.componentInstance.files().map((file) => file.name)).toEqual(['photo.png']);
    (rows[1].querySelector('button[aria-label^="Retry"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.handlers[1].files.map((file) => file.name)).toEqual(['photo.png']);
  });

  it('clears the waiting files and keeps the footer content', async () => {
    pick(input(), [csv()]);
    await fixture.whenStable();
    expect(el('.tx-file-upload__footer .own-action')).not.toBeNull();
    (all('.tx-file-upload__footer-buttons button')[0] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.files()).toEqual([]);
    expect(all('.tx-file-upload__file')).toHaveLength(0);
  });

  it('ignores the dialog and drops while disabled', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    const zone = el('.tx-file-upload__zone');
    expect(zone.getAttribute('tabindex')).toBe('-1');
    expect(input().disabled).toBe(true);
    drag(zone, 'drop', [csv()]);
    expect(fixture.componentInstance.files()).toEqual([]);
  });
});

describe('TxFileUpload single', () => {
  it('shows the picked file in place of the zone and syncs the form control and file', async () => {
    const fixture = TestBed.createComponent(SingleHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('.tx-file-upload__input') as HTMLInputElement;
    expect(input.multiple).toBe(false);
    expect(host.querySelector('.tx-file-upload__prompt')?.textContent?.trim()).toBe('Drop a file here or browse');
    pick(input, [csv('first.csv'), csv('second.csv')]);
    await fixture.whenStable();
    const zone = host.querySelector('.tx-file-upload__zone') as HTMLElement;
    expect(zone.getAttribute('data-state')).toBe('selected');
    expect(zone.getAttribute('role')).toBe('group');
    expect(host.querySelector('.tx-file-upload__name')?.textContent).toBe('first.csv');
    expect(fixture.componentInstance.control.value?.name).toBe('first.csv');
    expect(fixture.componentInstance.file()?.name).toBe('first.csv');
    pick(input, [csv('third.csv')]);
    await fixture.whenStable();
    expect(host.querySelector('.tx-file-upload__name')?.textContent).toBe('third.csv');
    const remove = Array.from(host.querySelectorAll('.tx-file-upload__selected-actions button')).at(-1) as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Remove third.csv');
    const dialog = vi.spyOn(input, 'click');
    remove.click();
    expect(dialog).not.toHaveBeenCalled();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBeNull();
    expect(host.querySelector('.tx-file-upload__zone')?.getAttribute('data-state')).toBe('empty');
    fixture.componentInstance.control.setValue(csv('from-form.csv'));
    await fixture.whenStable();
    expect(host.querySelector('.tx-file-upload__name')?.textContent).toBe('from-form.csv');
  });
});

describe('TxFileUpload url', () => {
  it('uploads automatically through HttpClient with the field name and headers', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const fixture = TestBed.createComponent(UrlHost);
    await fixture.whenStable();
    const http = TestBed.inject(HttpTestingController);
    pick(fixture.nativeElement.querySelector('.tx-file-upload__input'), [csv()]);
    const request = http.expectOne('/api/files');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-Token')).toBe('test');
    expect((request.request.body as FormData).get('attachment')).toBeInstanceOf(File);
    request.flush({ ok: true });
    await fixture.whenStable();
    expect(fixture.componentInstance.done.map((file) => file.name)).toEqual(['report.csv']);
    expect(fixture.nativeElement.querySelector('.tx-file-upload__meta')?.textContent).toContain('Uploaded');
    http.verify();
  });
});

describe('TxFileUpload modes and templates', () => {
  it('renders the basic button with the chosen file name and own templates', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const basic = host.querySelector('tx-file-upload') as HTMLElement;
    expect(basic.hasAttribute('data-styled')).toBe(false);
    expect(basic.querySelector('button')?.textContent?.trim()).toBe('Choose file');
    expect(basic.querySelector('.tx-file-upload__basic-label')?.textContent?.trim()).toBe('No file chosen');
    pick(basic.querySelector('.tx-file-upload__input') as HTMLInputElement, [png()]);
    await fixture.whenStable();
    expect(basic.querySelector('.tx-file-upload__basic-label')?.textContent?.trim()).toBe('photo.png');
    const own = host.querySelector('#own') as HTMLElement;
    expect(own.querySelector('.own-zone')?.textContent).toBe('Pick');
    pick(own.querySelector('.tx-file-upload__input') as HTMLInputElement, [png()]);
    await fixture.whenStable();
    (own.querySelector('.own-row') as HTMLElement).click();
    await fixture.whenStable();
    expect(own.querySelector('.own-row')).toBeNull();
  });
});

@Component({
  imports: [TxFileUpload],
  template: `
    <tx-file-upload
      multiple
      url="/api/upload"
      method="put"
      withCredentials
      [maxFileSize]="4096"
      [headers]="headers()"
      [fileLimit]="limit()"
      [invalidFileLimitMessage]="limitMessage()"
      [showUploadButton]="showUpload()"
      [showMessages]="showMessages()"
      [ariaLabel]="ariaLabel()"
      [chooseLabel]="chooseLabel()"
      [(files)]="files"
      (rejected)="rejections.push($event)"
      (uploadProgress)="progress.push($event.progress)"
      (uploadFailed)="failures.push($event)"
      (uploaded)="uploads.push($event)"
      (uploadedFileRemoved)="uploadedRemovals.push($event)"
      (beforeUpload)="$event.formData.append('extra', 'yes')"
      (cleared)="clears = clears + 1"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TargetHost {
  readonly upload = viewChild.required(TxFileUpload);
  readonly headers = signal<HttpHeaders | Record<string, string> | undefined>(undefined);
  readonly limit = signal<number | undefined>(undefined);
  readonly limitMessage = signal<string | undefined>(undefined);
  readonly showUpload = signal(true);
  readonly showMessages = signal(true);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly chooseLabel = signal<string | undefined>(undefined);
  readonly files = signal<File[]>([]);
  readonly rejections: TxFileRejection[][] = [];
  readonly progress: number[] = [];
  readonly failures: TxFileUploadErrorEvent[] = [];
  readonly uploads: TxFileUploadEvent[] = [];
  readonly uploadedRemovals: TxFileUploadedRemoveEvent[] = [];
  clears = 0;
}

@Component({
  imports: [TxFileUpload, ReactiveFormsModule],
  template: `<tx-file-upload multiple [formControl]="control" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MultipleFormHost {
  readonly control = new FormControl<File[] | null>(null);
}

@Component({
  imports: [TxFileUpload, TxField],
  template: `
    <tx-field label="Attachment"><tx-file-upload description="One file" [(file)]="file" /></tx-field>
    <tx-file-upload id="basic" mode="basic" multiple url="/api/upload" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FieldHost {
  readonly file = signal<File | null>(null);
}

@Component({
  imports: [TxFileUpload, TxFileUploadDropzoneTemplate],
  template: `
    <tx-file-upload multiple>
      <ng-template txFileUploadDropzone let-choose="choose">
        <span class="own-choose" (click)="choose()" (keydown.enter)="choose()" tabindex="-1">Pick</span>
      </ng-template>
    </tx-file-upload>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ChooseHost {}

class FakeRequest {
  static readonly all: FakeRequest[] = [];
  method = '';
  url = '';
  withCredentials = false;
  status = 0;
  aborted = false;
  body: FormData | null = null;
  readonly headers: Record<string, string> = {};
  readonly upload: { onprogress: ((event: Pick<ProgressEvent, 'lengthComputable' | 'loaded' | 'total'>) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    FakeRequest.all.push(this);
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  send(body: FormData): void {
    this.body = body;
  }

  abort(): void {
    this.aborted = true;
  }
}

describe('file upload extras', () => {
  it('guards template contexts and sorts media and unnamed PDFs', () => {
    const context: TxFileUploadFileContext = { $implicit: {} as TxFileUploadFileContext['$implicit'], index: 0, remove: () => undefined };
    const zone: TxFileUploadDropzoneContext = { $implicit: false, choose: () => undefined };
    expect(TxFileUploadFileTemplate.ngTemplateContextGuard({} as TxFileUploadFileTemplate, context)).toBe(true);
    expect(TxFileUploadDropzoneTemplate.ngTemplateContextGuard({} as TxFileUploadDropzoneTemplate, zone)).toBe(true);
    expect(TxFileUploadFileTemplate.ngTemplateContextGuard({} as TxFileUploadFileTemplate, null)).toBe(false);
    expect(fileKind(new File([''], 'clip.mp4', { type: 'video/mp4' }))).toBe('media');
    expect(fileKind(new File([''], 'voice', { type: 'audio/ogg' }))).toBe('media');
    expect(fileKind(new File([''], 'scan', { type: 'application/pdf' }))).toBe('pdf');
    expect(acceptLabel(undefined)).toBe('');
    expect(fileMatchesAccept(png(), undefined)).toBe(true);
  });
});

describe('TxFileUpload with a target', () => {
  let fixture: ComponentFixture<TargetHost>;
  let http: HttpTestingController;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const input = () => el('.tx-file-upload__input') as HTMLInputElement;
  const uploadButton = () => all('.tx-file-upload__footer-buttons button').at(-1) as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(TargetHost);
    await fixture.whenStable();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('hides the footer until files wait and when the upload button is off', async () => {
    expect(el('.tx-file-upload__footer')).toBeNull();
    pick(input(), [csv()]);
    await fixture.whenStable();
    expect(el('.tx-file-upload__footer')).not.toBeNull();
    fixture.componentInstance.showUpload.set(false);
    await fixture.whenStable();
    expect(el('.tx-file-upload__footer')).toBeNull();
    expect(el('.tx-file-upload__meta').textContent).toContain('Ready to upload');
  });

  it('labels the zone by an own label and the browse link by chooseLabel', async () => {
    fixture.componentInstance.ariaLabel.set('Attachments');
    fixture.componentInstance.chooseLabel.set('pick files');
    await fixture.whenStable();
    const zone = el('.tx-file-upload__zone');
    expect(zone.getAttribute('aria-label')).toBe('Attachments');
    expect(zone.hasAttribute('aria-labelledby')).toBe(false);
    expect(el('.tx-file-upload__link').textContent).toBe('pick files');
  });

  it('sends a PUT with progress events and fails on a bad response', async () => {
    fixture.componentInstance.headers.set(new HttpHeaders({ 'X-Token': 'own' }));
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    uploadButton().click();
    fixture.componentInstance.upload().upload();
    const request = http.expectOne('/api/upload');
    expect(request.request.method).toBe('PUT');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-Token')).toBe('own');
    expect((request.request.body as FormData).get('extra')).toBe('yes');
    expect((request.request.body as FormData).getAll('files')).toHaveLength(2);
    request.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 200 });
    request.event({ type: HttpEventType.UploadProgress, loaded: 10 });
    await fixture.whenStable();
    expect(fixture.componentInstance.progress).toEqual([25]);
    expect(el('.tx-file-upload__progress').getAttribute('aria-valuenow')).toBe('25');
    request.event(new HttpResponse({ status: 500, statusText: 'Server error' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.failures[0].files.map((file) => file.name)).toEqual(['report.csv', 'photo.png']);
    expect(all('.tx-file-upload__file').map((row) => row.getAttribute('data-status'))).toEqual(['failed', 'failed']);
    expect(el('.tx-file-upload__meta').textContent).toContain('Upload failed');
  });

  it('fails on a network error and retries the file', async () => {
    fixture.componentInstance.headers.set({ 'X-Token': 'record' });
    pick(input(), [csv()]);
    await fixture.whenStable();
    uploadButton().click();
    http.expectOne('/api/upload').error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(fixture.componentInstance.failures).toHaveLength(1);
    (el('button[aria-label^="Retry"]') as HTMLButtonElement).click();
    const retry = http.expectOne('/api/upload');
    expect(retry.request.headers.get('X-Token')).toBe('record');
    retry.flush({});
    await fixture.whenStable();
    expect(fixture.componentInstance.uploads).toHaveLength(1);
  });

  it('cancels the running request on clear', async () => {
    pick(input(), [csv()]);
    await fixture.whenStable();
    uploadButton().click();
    const request = http.expectOne('/api/upload');
    fixture.componentInstance.upload().clear();
    await fixture.whenStable();
    expect(request.cancelled).toBe(true);
    expect(fixture.componentInstance.clears).toBe(1);
    expect(fixture.componentInstance.files()).toEqual([]);
    fixture.componentInstance.upload().upload();
  });

  it('removes an uploaded file and reports the files left', async () => {
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    uploadButton().click();
    http.expectOne('/api/upload').flush({});
    await fixture.whenStable();
    expect(fixture.componentInstance.files()).toEqual([]);
    expect(all('.tx-file-upload__file').map((row) => row.getAttribute('data-status'))).toEqual(['uploaded', 'uploaded']);
    (el('.tx-file-upload__remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.uploadedRemovals.map((event) => [event.file.name, event.files.map((file) => file.name)])).toEqual([['report.csv', ['photo.png']]]);
    expect(all('.tx-file-upload__file')).toHaveLength(1);
  });

  it('drops the limit message once a file is removed, also with an own message', async () => {
    fixture.componentInstance.limit.set(1);
    fixture.componentInstance.limitMessage.set('Only {limit} file');
    await fixture.whenStable();
    pick(input(), [csv(), png()]);
    await fixture.whenStable();
    expect(all('.tx-file-upload__message-text').map((message) => message.textContent)).toEqual(['Only 1 file']);
    (el('.tx-file-upload__remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(all('.tx-file-upload__message')).toHaveLength(0);
  });

  it('keeps other messages when a file is removed without a limit', async () => {
    pick(input(), [csv('big.csv', 5000), csv()]);
    await fixture.whenStable();
    expect(all('.tx-file-upload__message-text').map((message) => message.textContent)).toEqual(['big.csv is larger than 4 kB']);
    (el('.tx-file-upload__remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(all('.tx-file-upload__message')).toHaveLength(1);
  });

  it('reports rejections without messages when messages are off', async () => {
    fixture.componentInstance.showMessages.set(false);
    await fixture.whenStable();
    pick(input(), [csv('big.csv', 5000)]);
    await fixture.whenStable();
    expect(fixture.componentInstance.rejections[0].map((rejection) => rejection.reason)).toEqual(['size']);
    expect(all('.tx-file-upload__message')).toHaveLength(0);
    expect(fixture.componentInstance.files()).toEqual([]);
  });

  it('adopts files set from outside and ignores empty picks', async () => {
    const first = csv('a.csv');
    const second = csv('b.csv');
    fixture.componentInstance.files.set([first, second]);
    await fixture.whenStable();
    expect(all('.tx-file-upload__name').map((name) => name.textContent)).toEqual(['a.csv', 'b.csv']);
    fixture.componentInstance.files.set([second]);
    await fixture.whenStable();
    expect(all('.tx-file-upload__name').map((name) => name.textContent)).toEqual(['b.csv']);
    pick(input(), null);
    pick(input(), []);
    await fixture.whenStable();
    expect(fixture.componentInstance.files()).toEqual([second]);
  });
});

describe('TxFileUpload over XMLHttpRequest', () => {
  @Component({
    imports: [TxFileUpload],
    template: `<tx-file-upload url="/api/raw" [headers]="headers()" (uploaded)="uploads.push($event)" (uploadFailed)="failures.push($event)" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class RawHost {
    readonly upload = viewChild.required(TxFileUpload);
    readonly headers = signal<HttpHeaders | Record<string, string> | undefined>(undefined);
    readonly uploads: TxFileUploadEvent[] = [];
    readonly failures: TxFileUploadErrorEvent[] = [];
  }

  let fixture: ComponentFixture<RawHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  async function start(headers?: HttpHeaders | Record<string, string>): Promise<FakeRequest> {
    fixture.componentInstance.headers.set(headers);
    await fixture.whenStable();
    pick(el('.tx-file-upload__input') as HTMLInputElement, [csv()]);
    await fixture.whenStable();
    (el('.tx-file-upload__selected-actions button') as HTMLButtonElement).click();
    await fixture.whenStable();
    return FakeRequest.all.at(-1) as FakeRequest;
  }

  beforeEach(async () => {
    FakeRequest.all.length = 0;
    vi.stubGlobal('XMLHttpRequest', FakeRequest);
    TestBed.configureTestingModule({ providers: [{ provide: HttpClient, useValue: null }] });
    fixture = TestBed.createComponent(RawHost);
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('posts the form data with HttpHeaders, progress and success', async () => {
    const request = await start(new HttpHeaders({ 'X-Token': 'raw' }));
    expect(request.method).toBe('POST');
    expect(request.url).toBe('/api/raw');
    expect(request.headers).toEqual({ 'X-Token': 'raw' });
    expect(request.body?.get('files')).toBeInstanceOf(File);
    request.upload.onprogress?.({ lengthComputable: true, loaded: 3, total: 4 });
    request.upload.onprogress?.({ lengthComputable: false, loaded: 4, total: 0 });
    await fixture.whenStable();
    expect(el('.tx-file-upload__progress').getAttribute('aria-valuenow')).toBe('75');
    request.status = 201;
    request.onload?.();
    await fixture.whenStable();
    expect(fixture.componentInstance.uploads[0].originalEvent).toBe(request);
    expect(el('.tx-file-upload__meta').textContent).toContain('Uploaded');
  });

  it('fails on an error status and on a network error, with record headers', async () => {
    const request = await start({ 'X-Token': 'record' });
    expect(request.headers).toEqual({ 'X-Token': 'record' });
    request.status = 404;
    request.onload?.();
    await fixture.whenStable();
    expect(fixture.componentInstance.failures).toHaveLength(1);
    (el('.tx-file-upload__selected-actions button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const retry = FakeRequest.all.at(-1) as FakeRequest;
    expect(retry).not.toBe(request);
    retry.onerror?.();
    await fixture.whenStable();
    expect(fixture.componentInstance.failures).toHaveLength(2);
    expect(el('.tx-file-upload__meta').textContent).toContain('Upload failed');
  });

  it('aborts the request when the component is destroyed', async () => {
    const request = await start();
    expect(request.headers).toEqual({});
    fixture.destroy();
    expect(request.aborted).toBe(true);
  });
});

describe('TxFileUpload custom upload edge cases', () => {
  let fixture: ComponentFixture<MultipleHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(MultipleHost);
    await fixture.whenStable();
  });

  it('uses the default failure text and ignores calls for files outside the batch or already done', async () => {
    pick(el('.tx-file-upload__input') as HTMLInputElement, [csv(), png()]);
    await fixture.whenStable();
    (all('.tx-file-upload__footer-buttons button').at(-1) as HTMLButtonElement).click();
    await fixture.whenStable();
    const handler = fixture.componentInstance.handlers[0];
    handler.complete(csv('stranger.csv'));
    handler.complete(handler.files[0]);
    handler.complete(handler.files[0]);
    handler.fail(undefined, handler.files[0]);
    handler.fail(undefined, handler.files[1]);
    handler.fail(undefined, handler.files[1]);
    await fixture.whenStable();
    expect(fixture.componentInstance.uploads).toHaveLength(1);
    const rows = all('.tx-file-upload__file');
    expect(rows.map((row) => row.getAttribute('data-status'))).toEqual(['uploaded', 'failed']);
    expect(rows[1].textContent).toContain('Upload failed');
  });

  it('ignores drags without files and keeps highlighting through nested elements', async () => {
    const zone = el('.tx-file-upload__zone');
    expect(drag(zone, 'dragenter', [], ['text/plain']).defaultPrevented).toBe(false);
    expect(drag(zone, 'dragover', [], ['text/plain']).defaultPrevented).toBe(false);
    expect(drag(zone, 'dragleave').defaultPrevented).toBe(false);
    drag(zone, 'dragenter');
    drag(zone, 'dragenter');
    expect(drag(zone, 'dragleave').defaultPrevented).toBe(true);
    await fixture.whenStable();
    expect(el('tx-file-upload').classList).toContain('tx-file-upload--dragging');
    drag(zone, 'dragleave');
    await fixture.whenStable();
    expect(el('tx-file-upload').classList).not.toContain('tx-file-upload--dragging');
    const empty = new Event('drop', { bubbles: true, cancelable: true });
    zone.dispatchEvent(empty);
    drag(zone, 'drop', []);
    expect(fixture.componentInstance.files()).toEqual([]);
  });

  it('opens nothing while disabled and only reacts to Enter and Space on the zone itself', async () => {
    const click = vi.spyOn(el('.tx-file-upload__input'), 'click');
    const zone = el('.tx-file-upload__zone');
    zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    el('.tx-file-upload__prompt').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(click).not.toHaveBeenCalled();
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();
    fixture.componentInstance.upload().choose();
    expect(click).not.toHaveBeenCalled();
  });
});

describe('TxFileUpload forms, fields and templates', () => {
  it('writes arrays from a form control into the multiple list and keeps known entries', async () => {
    const fixture = TestBed.createComponent(MultipleFormHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const first = csv('a.csv');
    const second = csv('b.csv');
    fixture.componentInstance.control.setValue([first, second]);
    await fixture.whenStable();
    expect(Array.from(host.querySelectorAll('.tx-file-upload__name')).map((name) => name.textContent)).toEqual(['a.csv', 'b.csv']);
    fixture.componentInstance.control.setValue([second]);
    await fixture.whenStable();
    expect(Array.from(host.querySelectorAll('.tx-file-upload__name')).map((name) => name.textContent)).toEqual(['b.csv']);
  });

  it('writes an array into a single upload as its first file and rejects a wrong type', async () => {
    const fixture = TestBed.createComponent(SingleHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    fixture.componentInstance.control.setValue([csv('one.csv'), csv('two.csv')] as unknown as File);
    await fixture.whenStable();
    expect(host.querySelector('.tx-file-upload__name')?.textContent).toBe('one.csv');
    expect(fixture.componentInstance.file()?.name).toBe('one.csv');
    pick(host.querySelector('.tx-file-upload__input') as HTMLInputElement, [png()]);
    await fixture.whenStable();
    expect(host.querySelector('.tx-file-upload__message-text')?.textContent).toBe('photo.png is not a supported file type (CSV)');
    expect(host.querySelector('.tx-file-upload__name')?.textContent).toBe('one.csv');
  });

  it('labels the zone by the field, syncs the file model and ignores keys on the selected card', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const upload = host.querySelector('tx-field tx-file-upload') as HTMLElement;
    const zone = upload.querySelector('.tx-file-upload__zone') as HTMLElement;
    const labelledBy = zone.getAttribute('aria-labelledby')?.split(' ') ?? [];
    expect(labelledBy).toHaveLength(2);
    expect(host.querySelector('#' + labelledBy[0])?.textContent).toContain('Attachment');
    fixture.componentInstance.file.set(csv('model.csv'));
    await fixture.whenStable();
    expect(upload.querySelector('.tx-file-upload__name')?.textContent).toBe('model.csv');
    expect(zone.getAttribute('aria-describedby')).toMatch(/-hint$/);
    expect(zone.getAttribute('aria-labelledby')?.split(' ')[1]).toMatch(/-prompt$/);
    const click = vi.spyOn(upload.querySelector('.tx-file-upload__input') as HTMLInputElement, 'click');
    zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(click).not.toHaveBeenCalled();
    fixture.componentInstance.file.set(null);
    await fixture.whenStable();
    expect(upload.querySelector('.tx-file-upload__zone')?.getAttribute('data-state')).toBe('empty');
  });

  it('names the count of files in the basic multiple mode and offers the upload', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    const basic = (fixture.nativeElement as HTMLElement).querySelector('#basic') as HTMLElement;
    expect(basic.querySelector('button')?.textContent?.trim()).toBe('Choose files');
    pick(basic.querySelector('.tx-file-upload__input') as HTMLInputElement, [csv(), png()]);
    await fixture.whenStable();
    expect(basic.querySelector('.tx-file-upload__basic-label')?.textContent?.trim()).toBe('2 files');
    expect(basic.querySelectorAll('button')).toHaveLength(2);
  });

  it('lets an own drop zone open the file dialog', async () => {
    const fixture = TestBed.createComponent(ChooseHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const click = vi.spyOn(host.querySelector('.tx-file-upload__input') as HTMLInputElement, 'click');
    (host.querySelector('.own-choose') as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('TxFileUpload recompiled by TestBed', () => {
  it('still finds its templates, actions and form binding when a test overrides the component', async () => {
    TestBed.overrideComponent(TxFileUpload, { set: { styles: [] } });
    const templates = TestBed.createComponent(TemplateHost);
    await templates.whenStable();
    const own = templates.nativeElement.querySelector('#own') as HTMLElement;
    expect(own.querySelector('.own-zone')?.textContent).toBe('Pick');
    pick(own.querySelector('.tx-file-upload__input') as HTMLInputElement, [png()]);
    await templates.whenStable();
    expect(own.querySelector('.own-row')?.textContent).toBe('photo.png');
    const multiple = TestBed.createComponent(MultipleHost);
    await multiple.whenStable();
    pick(multiple.nativeElement.querySelector('.tx-file-upload__input'), [csv()]);
    await multiple.whenStable();
    expect(multiple.nativeElement.querySelector('.tx-file-upload__footer .own-action')).not.toBeNull();
    const single = TestBed.createComponent(SingleHost);
    await single.whenStable();
    single.componentInstance.control.setValue(csv('bound.csv'));
    await single.whenStable();
    expect(single.nativeElement.querySelector('.tx-file-upload__name')?.textContent).toBe('bound.csv');
  });
});
