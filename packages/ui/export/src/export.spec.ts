import { TxExportField, TxExportRow } from './export.types';
import { buildExportTable, cellText, csvCell, downloadBlob, downloadCsv, exportMatrix, hexColor, inferType, localIso, matrixToCsv, readExportField, toDate, withExtension } from './export.utils';
import { printHtml } from './writers/print';
import { htmlTable, printPageCss, writeCsv, writeHtml, writeJson, writeMarkdown, writeTsv } from './writers/text';
import { crc32, zip } from './writers/zip';

interface User {
  name: string;
  email: string;
  team: { title: string };
  createdAt: string;
  score: number;
  active: boolean;
}

const USERS: User[] = [
  { name: 'Ada', email: '=HYPERLINK("x")', team: { title: 'Core' }, createdAt: '2026-01-05T10:00:00Z', score: 12.5, active: true },
  { name: 'Lin, "Jr"', email: 'lin@example.com', team: { title: 'Ops' }, createdAt: '2026-02-11T08:30:00Z', score: 7, active: false },
];

const FIELDS: TxExportField<User>[] = [
  { field: 'number', title: '#' },
  { field: 'name', title: 'Name' },
  { field: 'email' },
  { field: 'team.title', title: 'Team' },
  { field: 'createdAt', title: 'Created', aggregator: (value) => String(value).slice(0, 10) },
  { field: 'score', title: 'Score', formats: ['csv', 'excel'] },
  { field: 'active', title: 'Active' },
];

const CONTEXT = { locale: 'en-US', yes: 'Yes', no: 'No' };

describe('export table', () => {
  it('reads paths, numbers rows, runs aggregators and keeps fields of the format', () => {
    expect(exportMatrix(USERS, FIELDS, 'csv')).toEqual([
      ['#', 'Name', 'email', 'Team', 'Created', 'Score', 'Active'],
      [1, 'Ada', '=HYPERLINK("x")', 'Core', '2026-01-05', 12.5, true],
      [2, 'Lin, "Jr"', 'lin@example.com', 'Ops', '2026-02-11', 7, false],
    ]);
    expect(buildExportTable(USERS, FIELDS, 'pdf').columns.map((column) => column.key)).not.toContain('score');
    const aggregated = exportMatrix<TxExportRow>([{ place: 'x' }], [{ field: 'place', aggregator: (_value, _row, index) => `#${index}` }]);
    expect(aggregated[1]).toEqual(['#0']);
  });

  it('infers types and alignment unless the field sets them', () => {
    const table = buildExportTable(USERS, [...FIELDS, { field: 'name', title: 'Centered', align: 'center', width: 30, format: '@' }], 'csv');
    expect(table.columns.map((column) => [column.type, column.align])).toEqual([
      ['number', 'end'],
      ['text', 'start'],
      ['text', 'start'],
      ['text', 'start'],
      ['text', 'start'],
      ['number', 'end'],
      ['boolean', 'center'],
      ['text', 'center'],
    ]);
    expect(table.columns[7]).toMatchObject({ width: 30, format: '@' });
    expect(inferType([new Date(2026, 0, 1), null])).toBe('date');
    expect(inferType([new Date(2026, 0, 1, 9, 30)])).toBe('datetime');
    expect(inferType([])).toBe('text');
  });

  it('turns values into document text', () => {
    const column = { key: 'x', title: 'X', type: 'boolean' as const, align: 'center' as const };
    expect(cellText(true, column, CONTEXT)).toBe('Yes');
    expect(cellText(null, column, CONTEXT)).toBe('');
    expect(cellText(new Date(2026, 0, 5), { ...column, type: 'date' }, CONTEXT)).toBe('Jan 5, 2026');
    expect(cellText({ a: 1 }, { ...column, type: 'text' }, CONTEXT)).toBe('{"a":1}');
  });

  it('reads missing rows and broken paths as undefined', () => {
    expect(readExportField(null, 'a')).toBeUndefined();
    expect(readExportField(undefined, 'a.b')).toBeUndefined();
    expect(readExportField({ a: null }, 'a.b.c')).toBeUndefined();
    expect(readExportField({ 'a.b': 1, a: { b: 2 } }, 'a.b')).toBe(1);
  });

  it('turns strings, numbers and dates into valid dates only', () => {
    expect(toDate('2026-03-04T05:06:07')).toEqual(new Date(2026, 2, 4, 5, 6, 7));
    expect(toDate(0)).toEqual(new Date(0));
    expect(toDate('nope')).toBeNull();
    expect(toDate(new Date(Number.NaN))).toBeNull();
    expect(toDate(true)).toBeNull();
  });

  it('writes dates by column type and time of day', () => {
    const column = { key: 'x', title: 'X', type: 'datetime' as const, align: 'start' as const };
    expect(cellText('2026-01-05T09:30:00', column, CONTEXT)).toMatch(/^Jan 5, 2026, 9:30\sAM$/);
    expect(cellText(new Date(2026, 0, 5, 9, 30), { ...column, type: 'text' }, CONTEXT)).toMatch(/^Jan 5, 2026, 9:30\sAM$/);
    expect(cellText('2026-01-05T09:30:00', { ...column, type: 'date' }, CONTEXT)).toBe('Jan 5, 2026');
    expect(cellText('soon', { ...column, type: 'date' }, CONTEXT)).toBe('soon');
    expect(localIso(new Date(2026, 0, 5), 'text')).toBe('2026-01-05');
    expect(localIso(new Date(2026, 0, 5, 9, 5, 7), 'text')).toBe('2026-01-05 09:05:07');
    expect(localIso(new Date(2026, 0, 5), 'datetime')).toBe('2026-01-05 00:00');
    const invalid = new Date(Number.NaN);
    expect(localIso(invalid, 'date')).toBe(invalid);
  });

  it('quotes empty cells and writes dates and objects into CSV', () => {
    expect(csvCell(undefined, ',', { quoteAll: true })).toBe('""');
    expect(csvCell(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-01-05T00:00:00.000Z');
    expect(csvCell({ a: 1 })).toBe('"{""a"":1}"');
    expect(matrixToCsv([['a', 'b;c'], [1, null]], ';')).toBe('a;"b;c"\r\n1;');
  });

  it('normalises colours and extensions', () => {
    expect(hexColor('#abc', '000000')).toBe('AABBCC');
    expect(hexColor('nope', '#112233')).toBe('112233');
    expect(withExtension('Report.CSV', 'csv')).toBe('Report.CSV');
    expect(withExtension('report', 'xlsx')).toBe('report.xlsx');
  });
});

describe('text writers', () => {
  const table = buildExportTable(USERS, FIELDS, 'csv');

  it('guards formulas, keeps signed numbers and quotes special cells', () => {
    expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(csvCell('@cmd')).toBe("'@cmd");
    expect(csvCell('-12.5')).toBe('-12.5');
    expect(csvCell('+380501234567')).toBe('+380501234567');
    expect(csvCell('-')).toBe('-');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('two\nlines')).toBe('"two\nlines"');
    expect(csvCell(null)).toBe('');
    expect(csvCell('=1', ',', { formulaGuard: false })).toBe('=1');
    expect(csvCell('a', ',', { quoteAll: true })).toBe('"a"');
  });

  it('writes CSV with its options', () => {
    expect(writeCsv(table).split('\r\n')).toEqual([
      '#,Name,email,Team,Created,Score,Active',
      `1,Ada,"'=HYPERLINK(""x"")",Core,2026-01-05,12.5,true`,
      '2,"Lin, ""Jr""",lin@example.com,Ops,2026-02-11,7,false',
    ]);
    const dated = buildExportTable([{ d: new Date(2026, 9, 1), t: new Date(2026, 9, 1, 9, 5) }], [{ field: 'd' }, { field: 't' }]);
    expect(writeCsv(dated, { header: false })).toBe('2026-10-01,2026-10-01 09:05');
    expect(JSON.parse(writeJson(dated))).toEqual([{ d: '2026-10-01', t: '2026-10-01 09:05' }]);
    const semicolon = writeCsv(table, { separator: ';', header: false, lineEnding: '\n' });
    expect(semicolon.split('\n')).toHaveLength(2);
    expect(semicolon.startsWith('1;Ada;')).toBe(true);
  });

  it('writes TSV, JSON, Markdown and HTML', () => {
    expect(writeTsv(table, CONTEXT).split('\n')[2]).toBe('2\tLin, "Jr"\tlin@example.com\tOps\t2026-02-11\t7\tNo');
    expect(JSON.parse(writeJson(table))[0]).toEqual({ number: 1, name: 'Ada', email: '=HYPERLINK("x")', 'team.title': 'Core', createdAt: '2026-01-05', score: 12.5, active: true });
    expect(Object.keys(JSON.parse(writeJson(table, { keys: 'title', indent: 0 }))[0])).toContain('Team');
    const markdown = writeMarkdown(buildExportTable([{ a: 'x|y\nz', n: 2 }], [{ field: 'a' }, { field: 'n' }]), { title: 'Report' }, CONTEXT);
    expect(markdown).toBe('# Report\n\n| a | n |\n| --- | ---: |\n| x\\|y<br>z | 2 |\n');
    const html = writeHtml(buildExportTable([{ a: '<b>&' }], [{ field: 'a', title: 'A' }]), { title: 'T & C', showDate: false, lang: 'en-US' }, CONTEXT);
    expect(html).toContain('<html lang="en-US">');
    expect(html).toContain('<h1>T &amp; C</h1>');
    expect(html).toContain('<td>&lt;b&gt;&amp;</td>');
  });
});

describe('more text writers', () => {
  const table = buildExportTable(
    [
      { name: 'Ada', score: 1, done: true, note: undefined },
      { name: 'Lin', score: 2, done: false, note: 'x' },
    ],
    [{ field: 'name', title: '' }, { field: 'score', title: 'Score' }, { field: 'done', title: 'Done' }, { field: 'note', title: 'Note' }],
  );

  it('writes empty JSON values as null', () => {
    expect(JSON.parse(writeJson(table))[0]).toEqual({ name: 'Ada', score: 1, done: true, note: null });
  });

  it('aligns HTML cells and leaves the head out on request', () => {
    const html = htmlTable(table, CONTEXT);
    expect(html).toContain('<th>name</th><th style="text-align:right">Score</th><th style="text-align:center">Done</th>');
    expect(html).toContain('<td style="text-align:center">Yes</td>');
    expect(htmlTable(table, CONTEXT, false)).not.toContain('<thead>');
  });

  it('writes an HTML document with a subtitle, a date, page CSS and own styles', () => {
    const html = writeHtml(table, { subtitle: 'Q1\nend', showDate: true, header: false, page: '@page{}', styles: '.x{}' }, CONTEXT, new Date(2026, 0, 2, 3, 4));
    expect(html).toContain('<html><head>');
    expect(html).toContain('<title>Export</title>');
    expect(html).not.toContain('<h1>');
    expect(html).toContain('<p class="subtitle">Q1<br>end</p>');
    expect(html).toMatch(/<p class="date">Jan 2, 2026, 3:04\sAM<\/p>/);
    expect(html).toContain('@page{}.x{}</style>');
    expect(html).not.toContain('<thead>');
  });

  it('builds print page CSS from the page options', () => {
    expect(printPageCss({}, 3)).toBe('@page { size: 595.28pt 841.89pt; margin: 36pt 36pt 36pt 36pt; } @media print { body { margin: 0; } }');
    expect(printPageCss({ pageSize: 'letter', orientation: 'landscape', margin: [10, 20, 30, 40] }, 1)).toContain('size: 792pt 612pt; margin: 10pt 20pt 30pt 40pt;');
  });

  it('writes Markdown without a header and with centered columns', () => {
    expect(writeMarkdown(table, { header: false }, CONTEXT)).toBe('|   |   |   |   |\n| --- | ---: | :---: | --- |\n| Ada | 1 | Yes |  |\n| Lin | 2 | No | x |\n');
    expect(writeMarkdown(table, {}, CONTEXT).split('\n')[0]).toBe('| name | Score | Done | Note |');
    expect(writeMarkdown(buildExportTable([{}], [{ field: '' }]), {}, CONTEXT)).toBe('|   |\n| --- |\n|  |\n');
  });
});

describe('downloads', () => {
  afterEach(() => vi.useRealTimers());

  it('does nothing without object URLs', () => {
    const host = { defaultView: null } as unknown as Document;
    expect(() => downloadBlob(host, new Blob(['x']), 'x.txt')).not.toThrow();
  });

  it('clicks a hidden link and revokes the URL later', () => {
    vi.useFakeTimers();
    const revoked: string[] = [];
    const names: string[] = [];
    const link = document.createElement('a');
    vi.spyOn(link, 'click').mockImplementation(() => names.push(link.download));
    const view = {
      URL: { createObjectURL: () => 'blob:own', revokeObjectURL: (url: string) => revoked.push(url) },
      setTimeout: (handler: () => void, timeout: number) => setTimeout(handler, timeout),
    };
    const host = { defaultView: view, createElement: () => link, body: document.body } as unknown as Document;
    downloadCsv(host, 'a,b', 'report');
    expect(names).toEqual(['report.csv']);
    expect(link.isConnected).toBe(false);
    expect(revoked).toEqual([]);
    vi.advanceTimersByTime(1000);
    expect(revoked).toEqual(['blob:own']);
  });
});

describe('print', () => {
  class FakeView extends EventTarget {
    focused = 0;
    printed = 0;
    focus(): void {
      this.focused++;
    }
    print(): void {
      this.printed++;
    }
  }

  const setup = (view: FakeView | null) => {
    const container = document.createElement('div');
    const frame = document.createElement('iframe');
    Object.defineProperty(frame, 'contentWindow', { value: view });
    const host = { createElement: () => frame, body: container } as unknown as Document;
    return { container, frame, host };
  };

  afterEach(() => vi.useRealTimers());

  it('prints the HTML from a hidden frame and removes it after printing', async () => {
    vi.useFakeTimers();
    const view = new FakeView();
    const { container, frame, host } = setup(view);
    const done = printHtml(host, '<p>Report</p>');
    expect(container.contains(frame)).toBe(true);
    expect(frame.srcdoc).toBe('<p>Report</p>');
    expect(frame.getAttribute('aria-hidden')).toBe('true');
    expect(frame.getAttribute('tabindex')).toBe('-1');
    frame.dispatchEvent(new Event('load'));
    await done;
    expect([view.focused, view.printed]).toEqual([1, 1]);
    view.dispatchEvent(new Event('afterprint'));
    expect(container.contains(frame)).toBe(true);
    vi.advanceTimersByTime(0);
    expect(container.contains(frame)).toBe(false);
    vi.advanceTimersByTime(60000);
    expect(container.contains(frame)).toBe(false);
  });

  it('removes the frame after a minute without afterprint', async () => {
    vi.useFakeTimers();
    const view = new FakeView();
    const { container, frame, host } = setup(view);
    const done = printHtml(host, '<p>x</p>');
    frame.dispatchEvent(new Event('load'));
    await done;
    vi.advanceTimersByTime(59999);
    expect(container.contains(frame)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(container.contains(frame)).toBe(false);
  });

  it('gives up without a frame window', async () => {
    const { container, frame, host } = setup(null);
    const done = printHtml(host, '<p>x</p>');
    frame.dispatchEvent(new Event('load'));
    await done;
    expect(container.contains(frame)).toBe(false);
  });
});

describe('zip', () => {
  it('computes CRC-32 and writes stored entries with a central directory', async () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    const bytes = await zip([{ name: 'a.txt', data: 'hello' }, { name: 'папка/б.txt', data: 'світ' }], new Date(2026, 0, 2, 3, 4, 6), false);
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(new TextDecoder().decode(bytes.subarray(30, 35))).toBe('a.txt');
    expect(new TextDecoder().decode(bytes.subarray(35, 40))).toBe('hello');
    const end = bytes.length - 22;
    expect(view.getUint32(end, true)).toBe(0x06054b50);
    expect(view.getUint16(end + 10, true)).toBe(2);
    const directory = view.getUint32(end + 16, true);
    expect(view.getUint32(directory, true)).toBe(0x02014b50);
    expect(view.getUint16(directory + 8, true) & 0x0800).toBe(0x0800);
  });

  it('stores byte entries as they are', async () => {
    const data = new Uint8Array([1, 2, 3]);
    const bytes = await zip([{ name: 'b', data }], new Date(1970, 0, 1), false);
    expect([...bytes.subarray(31, 34)]).toEqual([1, 2, 3]);
    expect(new DataView(bytes.buffer).getUint16(12, true)).toBe((0 << 9) | (1 << 5) | 1);
  });
});
