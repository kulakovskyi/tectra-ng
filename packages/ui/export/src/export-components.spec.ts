import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxExportButton, TxExportCsv, TxExportExcel, TxExportPdf, TxExportWord } from './export-button.component';
import { TxExport } from './export-menu.component';
import { TX_EXPORT_OPTIONS, mergeExportOptions, provideTxExport } from './export.service';
import { TxExportField, TxExportFormat, TxExportOptions } from './export.types';

interface User {
  name: string;
  email: string;
}

const USERS: User[] = [
  { name: 'Ada', email: 'ada@example.com' },
  { name: 'Alan', email: 'alan@example.com' },
];

@Component({
  imports: [TxExportCsv, TxExportExcel, TxExportWord, TxExportPdf, TxExportButton, TxExport],
  template: `
    <tx-export-csv id="csv" filename="users" [fields]="fields" [(data)]="data" [fetchData]="fetch()" [label]="label()" (exported)="files.push($event.filename)" (failed)="failures = failures + 1" />
    <tx-export-excel id="excel" [fields]="fields" [data]="data" />
    <tx-export-word id="word" [fields]="fields" [data]="data" />
    <tx-export-pdf id="pdf" [fields]="fields" [data]="data" tooltip="Save as PDF" />
    <tx-export-button id="json" format="json" [fields]="fields" [data]="data" [options]="options()" (exported)="files.push($event.filename)" />
    <tx-export-button id="copy" format="copy" [fields]="fields" [data]="data" />
    <tx-export id="menu" [formats]="formats()" [fields]="fields" [data]="data" title="Users" (exported)="files.push($event.filename)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly fields: TxExportField<User>[] = [
    { field: 'number', title: '#' },
    { field: 'name', title: 'Name' },
    { field: 'email', title: 'Email' },
  ];
  data: readonly User[] = USERS;
  readonly fetch = signal<(() => Promise<User[] | null>) | undefined>(undefined);
  readonly label = signal<string | undefined>(undefined);
  readonly options = signal<TxExportOptions>({ filename: 'people', json: { keys: 'title', indent: 0 } });
  readonly formats = signal<TxExportFormat[]>(['json', 'csv', 'copy']);
  readonly files: (string | null)[] = [];
  failures = 0;
}

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}

describe('export components', () => {
  let fixture: ComponentFixture<Host>;
  let blobs: Blob[];
  let names: string[];
  let clipboard: string[];
  const button = (id: string) => fixture.nativeElement.querySelector(`#${id} button`) as HTMLButtonElement;
  const settle = async () => {
    for (let i = 0; i < 6; i++) await fixture.whenStable();
  };

  beforeEach(async () => {
    blobs = [];
    names = [];
    clipboard = [];
    const url = window.URL as unknown as { createObjectURL?: (blob: Blob) => string; revokeObjectURL?: (url: string) => void };
    url.createObjectURL = (blob: Blob) => {
      blobs.push(blob);
      return 'blob:test';
    };
    url.revokeObjectURL = () => undefined;
    Object.defineProperty(window.navigator, 'clipboard', { configurable: true, writable: true, value: { writeText: (text: string) => Promise.resolve(void clipboard.push(text)) } });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    TestBed.configureTestingModule({ providers: [provideTxExport({ showDate: false, csv: { separator: ';' } })] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window.navigator, 'clipboard');
  });

  it('names icon buttons by the translated tooltip of the format', async () => {
    expect(button('csv').getAttribute('aria-label')).toBe('Export to CSV');
    expect(button('excel').getAttribute('aria-label')).toBe('Export to Excel');
    expect(button('word').getAttribute('aria-label')).toBe('Export to Word');
    expect(button('pdf').getAttribute('aria-label')).toBe('Save as PDF');
    expect(button('copy').getAttribute('aria-label')).toBe('Copy table');
    expect(fixture.nativeElement.querySelector('#excel').getAttribute('data-format')).toBe('excel');
    fixture.componentInstance.label.set('Export');
    await fixture.whenStable();
    expect(button('csv').hasAttribute('aria-label')).toBe(false);
  });

  it('downloads CSV with the global options and a BOM', async () => {
    button('csv').click();
    await settle();
    expect(names).toEqual(['users.csv']);
    expect(fixture.componentInstance.files).toEqual(['users.csv']);
    const text = await readBlob(blobs[0]);
    expect(text.replace(/^\ufeff/, '').split('\r\n')).toEqual(['#;Name;Email', '1;Ada;ada@example.com', '2;Alan;alan@example.com']);
  });

  it('downloads other formats with their extensions and own options', async () => {
    button('json').click();
    button('excel').click();
    button('word').click();
    await settle();
    expect([...names].sort()).toEqual(['ExportedData.docx', 'ExportedData.xlsx', 'people.json']);
    expect(JSON.parse(await readBlob(blobs[names.indexOf('people.json')]))).toEqual([
      { '#': 1, Name: 'Ada', Email: 'ada@example.com' },
      { '#': 2, Name: 'Alan', Email: 'alan@example.com' },
    ]);
  });

  it('copies the table as TSV and shows that it was copied', async () => {
    button('copy').click();
    await settle();
    expect(clipboard).toEqual(['#\tName\tEmail\n1\tAda\tada@example.com\n2\tAlan\talan@example.com']);
    expect(button('copy').getAttribute('aria-label')).toBe('Table copied');
  });

  it('loads rows first, cancels on null and ignores clicks while busy', async () => {
    let resolve: (rows: User[] | null) => void = () => undefined;
    let calls = 0;
    fixture.componentInstance.fetch.set(() => {
      calls += 1;
      return new Promise((done) => (resolve = done));
    });
    await fixture.whenStable();
    button('csv').click();
    await fixture.whenStable();
    expect(button('csv').getAttribute('aria-busy')).toBe('true');
    button('csv').click();
    await fixture.whenStable();
    expect(calls).toBe(1);
    resolve([USERS[0]]);
    await settle();
    expect(fixture.componentInstance.data).toEqual([USERS[0]]);
    expect(names).toEqual(['users.csv']);
    button('csv').click();
    await fixture.whenStable();
    resolve(null);
    await settle();
    expect(names).toHaveLength(1);
  });

  it('reports a failed load and lets the next click start again', async () => {
    let attempt = 0;
    fixture.componentInstance.fetch.set(() => (attempt++ === 0 ? Promise.reject(new Error('offline')) : Promise.resolve(USERS)));
    await fixture.whenStable();
    button('csv').click();
    await settle();
    expect(fixture.componentInstance.failures).toBe(1);
    button('csv').click();
    await settle();
    expect(names).toEqual(['users.csv']);
  });

  it('runs the first format from the menu button and lists the formats', async () => {
    const menu = fixture.debugElement.children.find((child) => child.nativeElement.id === 'menu')?.componentInstance as TxExport;
    expect(menu.items().map((item) => [item.id, item.label, item.icon])).toEqual([
      ['json', 'JSON', 'code'],
      ['csv', 'CSV', 'file'],
      ['copy', 'Copy table', 'copy'],
    ]);
    expect(fixture.nativeElement.querySelector('#menu button').textContent).toContain('Export');
    (fixture.nativeElement.querySelector('#menu button') as HTMLButtonElement).click();
    await settle();
    expect(names).toEqual(['ExportedData.json']);
    menu.items()[1].command?.({ item: menu.items()[1], originalEvent: new Event('click') });
    await settle();
    expect(names).toEqual(['ExportedData.json', 'ExportedData.csv']);
  });

  it('merges global and local options per format', () => {
    expect(TestBed.inject(TX_EXPORT_OPTIONS)).toEqual({ showDate: false, csv: { separator: ';' } });
    expect(mergeExportOptions({ title: 'A', csv: { separator: ';', bom: false } }, { csv: { separator: ',' }, excel: { sheetName: 'S' } }, undefined)).toEqual({
      title: 'A',
      csv: { separator: ',', bom: false },
      excel: { sheetName: 'S' },
    });
  });
});
