import { TxExportField, TxExportRow } from './export.types';
import { buildExportTable, cellText, csvCell, exportMatrix, hexColor, inferType, withExtension } from './export.utils';
import { writeCsv, writeHtml, writeJson, writeMarkdown, writeTsv } from './writers/text';
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
});
