import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxFileUpload } from './file-upload.component';
import { TxFileUploadActions, TxFileUploadDropzoneTemplate, TxFileUploadFileTemplate } from './file-upload.templates';
import { TxFileRejection, TxFileUploadEvent, TxFileUploadHandlerEvent, TxFileUploadSelectEvent } from './file-upload.types';
import { acceptLabel, fileKind, fileMatchesAccept, fileSizeParts } from './file-upload.utils';

const csv = (name = 'report.csv', size = 1536) => new File(['x'.repeat(size)], name, { type: 'text/csv', lastModified: 1 });
const png = (name = 'photo.png') => new File(['png'], name, { type: 'image/png', lastModified: 1 });

function pick(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  input.dispatchEvent(new Event('change'));
}

function drag(target: HTMLElement, type: string, files: File[] = []): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { types: ['Files'], files, dropEffect: 'none' } });
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
