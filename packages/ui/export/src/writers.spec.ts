import { TX_EXPORT_FONT } from '@tectra-ng/ui/export-font';
import { buildExportTable } from './export.utils';
import { base64ToBytes, compress } from './writers/bytes';
import { docxDocument, writeDocx } from './writers/docx';
import { pageGeometry } from './writers/page';
import { wrapText, writePdf } from './writers/pdf';
import { parseTrueType } from './writers/truetype';
import { columnName, excelSerial, excelWidths, sheetName, writeXlsx, xlsxParts } from './writers/xlsx';
import { zip } from './writers/zip';

const CONTEXT = { locale: 'en-US', yes: 'Yes', no: 'No' };

function readBlob(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
}

function latin1(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return text;
}

function bytesTable(size: number, write: (view: DataView) => void): Uint8Array {
  const bytes = new Uint8Array(size);
  write(new DataView(bytes.buffer));
  return bytes;
}

function sfnt(tables: Record<string, Uint8Array>, version = 0x00010000): Uint8Array {
  const tags = Object.keys(tables);
  const sizes = tags.map((tag) => Math.ceil(tables[tag].length / 4) * 4);
  const out = new Uint8Array(12 + tags.length * 16 + sizes.reduce((sum, size) => sum + size, 0));
  const view = new DataView(out.buffer);
  view.setUint32(0, version);
  view.setUint16(4, tags.length);
  let offset = 12 + tags.length * 16;
  tags.forEach((tag, index) => {
    const at = 12 + index * 16;
    for (let i = 0; i < 4; i++) out[at + i] = tag.charCodeAt(i);
    view.setUint32(at + 8, offset);
    view.setUint32(at + 12, tables[tag].length);
    out.set(tables[tag], offset);
    offset += sizes[index];
  });
  return out;
}

function cmapTable(records: readonly (readonly [number, number, Uint8Array])[]): Uint8Array {
  const subtables = [...new Set(records.map(([, , data]) => data))];
  const offsets = new Map<Uint8Array, number>();
  let size = 4 + records.length * 8;
  for (const data of subtables) {
    offsets.set(data, size);
    size += data.length;
  }
  return bytesTable(size, (view) => {
    view.setUint16(2, records.length);
    records.forEach(([platform, encoding, data], index) => {
      view.setUint16(4 + index * 8, platform);
      view.setUint16(6 + index * 8, encoding);
      view.setUint32(8 + index * 8, offsets.get(data) as number);
    });
    for (const data of subtables) new Uint8Array(view.buffer).set(data, offsets.get(data));
  });
}

const FORMAT_12 = bytesTable(40, (view) => {
  view.setUint16(0, 12);
  view.setUint32(12, 2);
  [0x41, 0x42, 1, 0x10000, 0x30000, 3].forEach((value, index) => view.setUint32(16 + index * 4, value));
});
const FORMAT_4 = bytesTable(36, (view) => {
  view.setUint16(0, 4);
  view.setUint16(6, 4);
  [0x62, 0xffff, 0, 0x61, 0xffff, 0, 1, 4, 0, 3, 0].forEach((value, index) => view.setUint16(14 + index * 2, value));
});
const FORMAT_0 = bytesTable(6, (view) => view.setUint16(0, 0));
const GLYF = bytesTable(76, (view) => {
  view.setInt16(0, 1);
  view.setInt16(12, -1);
  [
    [22, 0x29, 1],
    [32, 0x60, 3],
    [42, 0xa0, 9],
    [56, 0x00, 1],
  ].forEach(([at, flags, glyph]) => {
    view.setUint16(at, flags);
    view.setUint16(at + 2, glyph);
  });
});
const LOCA = [0, 0, 12, 64, 76];

function fontTables(longLoca: boolean, cmap: Uint8Array): Record<string, Uint8Array> {
  return {
    head: bytesTable(54, (view) => {
      view.setUint16(18, 1000);
      [-50, -200, 900, 800].forEach((value, index) => view.setInt16(36 + index * 2, value));
      view.setInt16(50, longLoca ? 1 : 0);
    }),
    hhea: bytesTable(36, (view) => {
      view.setInt16(4, 800);
      view.setInt16(6, -200);
      view.setUint16(34, 2);
    }),
    maxp: bytesTable(6, (view) => view.setUint16(4, 4)),
    hmtx: bytesTable(8, (view) => {
      view.setUint16(0, 500);
      view.setUint16(4, 600);
    }),
    cmap,
    loca: longLoca ? bytesTable(20, (view) => LOCA.forEach((value, index) => view.setUint32(index * 4, value))) : bytesTable(10, (view) => LOCA.forEach((value, index) => view.setUint16(index * 2, value / 2))),
    glyf: GLYF,
  };
}

const NAME = bytesTable(58, (view) => {
  view.setUint16(2, 3);
  view.setUint16(4, 42);
  [
    [1, 0, 0, 1, 4, 0],
    [3, 1, 0x409, 6, 4, 4],
    [1, 0, 0, 6, 8, 8],
  ].forEach((record, index) => record.forEach((value, field) => view.setUint16(6 + index * 12 + field * 2, value)));
  [...'Fam '].forEach((char, index) => view.setUint8(42 + index, char.charCodeAt(0)));
  view.setUint16(46, 0x20);
  view.setUint16(48, 0x20);
  [...'Mac-Font'].forEach((char, index) => view.setUint8(50 + index, char.charCodeAt(0)));
});

function withBlobStreams(): void {
  Object.defineProperty(Blob.prototype, 'stream', {
    configurable: true,
    value(this: Blob) {
      const read = readBlob(this);
      return new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(await read);
          controller.close();
        },
      });
    },
  });
}

const ROWS = [
  { name: 'Ada', total: 1240.5, paid: true, due: new Date(2026, 0, 5), note: 'Line one\nline two' },
  { name: 'Оксана', total: 860, paid: false, due: new Date(2026, 1, 11, 9, 30), note: '=1+1' },
];

describe('excel writer', () => {
  it('names columns and converts dates', () => {
    expect([0, 25, 26, 701, 702].map(columnName)).toEqual(['A', 'Z', 'AA', 'ZZ', 'AAA']);
    expect(excelSerial(new Date(1900, 0, 1))).toBe(2);
    expect(excelSerial(new Date(2026, 0, 5, 12))).toBe(46027.5);
    expect(sheetName('Q1: [sales]/2026 with a very long name')).toBe('Q1   sales  2026 with a very lo');
    expect(sheetName('')).toBe('Sheet1');
  });

  it('writes typed cells, formats, widths, frozen header and filter', () => {
    const table = buildExportTable(ROWS, [
      { field: 'name', title: 'Name', width: 24 },
      { field: 'total', title: 'Total', format: '#,##0.00' },
      { field: 'paid', title: 'Paid' },
      { field: 'due', title: 'Due', type: 'date' },
      { field: 'note', title: 'Note' },
    ]);
    const { sheet, styles } = xlsxParts(table, { sheetName: 'Invoices', headerBackground: '#FFEECC', dateFormat: 'dd.mm.yyyy' });
    expect(sheet).toContain('<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>');
    expect(sheet).toContain('<col min="1" max="1" width="24" customWidth="1"/>');
    expect(sheet).toContain('<autoFilter ref="A1:E3"/>');
    expect(sheet).toContain('<c r="A1" t="inlineStr" s="1"><is><t xml:space="preserve">Name</t></is></c>');
    expect(sheet).toMatch(/<c r="B2" s="\d+"><v>1240.5<\/v><\/c>/);
    expect(sheet).toContain('<c r="C2" t="b" s="');
    expect(sheet).toMatch(/<c r="D2" s="\d+"><v>46027<\/v><\/c>/);
    expect(sheet).toContain('<t xml:space="preserve">=1+1</t>');
    expect(sheet).toContain('<t xml:space="preserve">Оксана</t>');
    expect(styles).toContain('<numFmt numFmtId="164" formatCode="#,##0.00"/>');
    expect(styles).toContain('<numFmt numFmtId="165" formatCode="dd.mm.yyyy"/>');
    expect(styles).toContain('<fgColor rgb="FFFFEECC"/>');
    expect(styles).toContain('wrapText="1"');
    const plain = xlsxParts(table, { header: false, freezeHeader: false, autoFilter: false }).sheet;
    expect(plain).not.toContain('state="frozen"');
    expect(plain).not.toContain('autoFilter');
    expect(plain).toContain('<row r="1"><c r="A1" t="inlineStr"><is><t xml:space="preserve">Ada</t>');
  });

  it('sizes columns from content within limits', () => {
    const table = buildExportTable([{ a: 'x'.repeat(100), b: 'y' }], [{ field: 'a' }, { field: 'b' }]);
    expect(excelWidths(table)).toEqual([60, 8]);
    expect(excelWidths(table, { minWidth: 4, maxWidth: 30 })).toEqual([30, 4]);
    expect(excelWidths(table, { autoWidth: false })).toEqual([10, 10]);
  });

  it('packs a workbook', async () => {
    const blob = await writeXlsx(buildExportTable(ROWS, [{ field: 'name' }]), { compress: false });
    const text = latin1(await readBlob(blob));
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    for (const part of ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/worksheets/sheet1.xml', 'xl/styles.xml', 'docProps/core.xml']) {
      expect(text).toContain(part);
    }
  });
});

describe('word writer', () => {
  const table = buildExportTable(ROWS, [
    { field: 'name', title: 'Name' },
    { field: 'total', title: 'Total' },
    { field: 'paid', title: 'Paid' },
  ]);

  it('writes a table with a repeating header, alignment and page setup', () => {
    const xml = docxDocument(table, { title: 'Invoices', subtitle: 'Q1', showDate: false, striped: true, pageSize: 'letter', orientation: 'landscape', margin: 50 }, CONTEXT, new Date(2026, 0, 1));
    expect(xml).toContain('<w:tblHeader/>');
    expect(xml).toContain('<w:jc w:val="right"/>');
    expect(xml).toContain('<w:t xml:space="preserve">Invoices</w:t>');
    expect(xml).toContain('<w:t xml:space="preserve">Q1</w:t>');
    expect(xml).toContain('<w:t xml:space="preserve">Оксана</w:t>');
    expect(xml).toContain('<w:t xml:space="preserve">No</w:t>');
    expect(xml).toContain('<w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>');
    expect(xml).toContain('w:top="1000"');
    expect(xml).toContain('w:fill="F9FAFB"');
    expect(xml).toContain('<w:footerReference');
    const plain = docxDocument(table, { header: false, gridlines: false, pageNumbers: false }, CONTEXT, new Date());
    expect(plain).not.toContain('<w:tblHeader/>');
    expect(plain).not.toContain('<w:insideV');
    expect(plain).not.toContain('<w:footerReference');
  });

  it('packs a document with a page number footer', async () => {
    const text = latin1(await readBlob(await writeDocx(table, { compress: false }, CONTEXT)));
    expect(text).toContain('word/document.xml');
    expect(text).toContain('word/footer1.xml');
    expect(text).toContain(' PAGE ');
  });
});

describe('pdf writer', () => {
  it('reads and subsets the bundled font', () => {
    const font = parseTrueType(base64ToBytes(TX_EXPORT_FONT.regular));
    const a = font.glyphId('A'.codePointAt(0) as number);
    const zhe = font.glyphId('Ж'.codePointAt(0) as number);
    expect(a).toBeGreaterThan(0);
    expect(zhe).toBeGreaterThan(0);
    expect(font.advance(a)).toBeGreaterThan(0);
    expect(font.name).toBe('Onest-Regular');
    const subset = font.subset(new Set([a, zhe]));
    expect(subset.length).toBeLessThan(base64ToBytes(TX_EXPORT_FONT.regular).length / 2);
    const again = parseTrueType(subset);
    expect(again.glyphId('Ж'.codePointAt(0) as number)).toBe(zhe);
    expect(again.advance(zhe)).toBe(font.advance(zhe));
  });

  it('wraps words and breaks long ones', () => {
    const measure = (text: string) => text.length;
    expect(wrapText('one two three', 7, measure)).toEqual(['one two', 'three']);
    expect(wrapText('abcdefghij', 4, measure)).toEqual(['abcd', 'efgh', 'ij']);
    expect(wrapText('a\nb', 10, measure)).toEqual(['a', 'b']);
  });

  it('picks the page size and orientation', () => {
    expect(pageGeometry('a4', 'auto', undefined, 3)).toMatchObject({ width: 595.28, landscape: false, margin: [36, 36, 36, 36] });
    expect(pageGeometry('a4', 'auto', 20, 8)).toMatchObject({ width: 841.89, landscape: true, margin: [20, 20, 20, 20] });
    expect(pageGeometry([300, 200], 'portrait', [1, 2, 3, 4], 1)).toMatchObject({ width: 200, height: 300, margin: [1, 2, 3, 4] });
  });

  it('writes pages with real text, a repeating header and page numbers', async () => {
    const rows = Array.from({ length: 120 }, (_, index) => ({ id: index + 1, name: index % 2 ? 'Оксана Коваль' : 'Ada Lovelace', total: index * 10.5 }));
    const table = buildExportTable(rows, [
      { field: 'id', title: '#' },
      { field: 'name', title: 'Имя' },
      { field: 'total', title: 'Total' },
    ]);
    const blob = await writePdf(table, { title: 'Звіт', subtitle: 'Q1', showDate: true, compress: false, author: 'tectra' }, TX_EXPORT_FONT, CONTEXT, new Date(2026, 0, 2, 3, 4, 5));
    const text = latin1(await readBlob(blob));
    expect(blob.type).toBe('application/pdf');
    expect(text.startsWith('%PDF-1.7')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    const pages = Number(/\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/.exec(text)?.[1]);
    expect(pages).toBeGreaterThan(2);
    expect(text).toContain('/BaseFont /TXREGU+Onest-Regular');
    expect(text).toContain('/BaseFont /TXBOLD+Onest-SemiBold');
    expect(text).toContain('/CreationDate (D:20260102030405)');
    expect(text).toContain('/Title <FEFF0417043204560442>');
    const zhe = parseTrueType(base64ToBytes(TX_EXPORT_FONT.bold)).glyphId('И'.codePointAt(0) as number).toString(16).padStart(4, '0');
    expect(text).toContain(`<${zhe}> <0418>`);
    const headers = text.match(/<[0-9a-f]+> Tj ET/g) ?? [];
    expect(headers.length).toBeGreaterThan(360);
    const xref = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.slice(xref, xref + 4)).toBe('xref');
  });

  it('draws one empty header row without data', async () => {
    const blob = await writePdf(buildExportTable([], [{ field: 'a', title: 'A' }]), { compress: false, pageNumbers: false }, { regular: TX_EXPORT_FONT.regular }, CONTEXT);
    const text = latin1(await readBlob(blob));
    expect(/\/Count 1/.test(text)).toBe(true);
    expect(text).not.toContain('TXBOLD');
    expect(text).toContain('2 Tr');
  });
});

describe('truetype reader', () => {
  it('rejects other font formats and missing tables', () => {
    expect(() => parseTrueType(sfnt({}, 0x4f54544f))).toThrow('Only TrueType (glyf) fonts can be embedded');
    expect(() => parseTrueType(sfnt({ hhea: new Uint8Array(36) }))).toThrow('Font has no head table');
  });

  it('reads full Unicode maps, Mac names and composite glyphs', () => {
    const cmap = cmapTable([
      [1, 0, FORMAT_0],
      [0, 3, FORMAT_4],
      [3, 1, FORMAT_4],
      [0, 4, FORMAT_12],
      [3, 10, FORMAT_12],
    ]);
    const font = parseTrueType(sfnt({ ...fontTables(true, cmap), 'OS/2': bytesTable(2, (view) => view.setUint16(0, 1)), name: NAME }));
    expect(font).toMatchObject({ name: 'Mac-Font', unitsPerEm: 1000, ascent: 800, descent: -200, capHeight: 560, bbox: [-50, -200, 900, 800], numGlyphs: 4 });
    expect([0x41, 0x42, 0x43, 0x10005, 0x1ffff, 0x20000].map((code) => font.glyphId(code))).toEqual([1, 2, 0, 8, 0x10002, 0]);
    expect([0, 1, 3].map((glyph) => font.advance(glyph))).toEqual([500, 600, 600]);
    const simple = font.subset(new Set([1]));
    const composite = font.subset(new Set([2]));
    expect(composite.length - simple.length).toBe(64);
    const again = parseTrueType(composite);
    expect(again.name).toBe('Mac-Font');
    expect(again.glyphId(0x41)).toBe(1);
    expect(again.subset(new Set([2])).length).toBe(composite.length);
  });

  it('reads segment maps with glyph arrays from short offsets', () => {
    const font = parseTrueType(sfnt(fontTables(false, cmapTable([[1, 0, FORMAT_0], [0, 3, FORMAT_4]])), 0x74727565));
    expect(font.name).toBe('Font');
    expect(font.capHeight).toBe(560);
    expect([0x60, 0x61, 0x62].map((code) => font.glyphId(code))).toEqual([0, 3, 0]);
    expect(font.subset(new Set([2])).length - font.subset(new Set([1])).length).toBe(64);
  });

  it('maps nothing without a supported character map', () => {
    const font = parseTrueType(sfnt(fontTables(true, cmapTable([[1, 0, FORMAT_0]]))));
    expect(font.glyphId(0x41)).toBe(0);
  });
});

describe('compression', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(Blob.prototype, 'stream');
  });

  it('gives up without compression streams', async () => {
    vi.stubGlobal('CompressionStream', undefined);
    expect(await compress(new Uint8Array([1, 2, 3]), 'deflate')).toBeNull();
  });

  it('deflates zip entries that get smaller and stores the rest', async () => {
    withBlobStreams();
    const bytes = await zip([{ name: 'a.txt', data: 'tectra '.repeat(200) }, { name: 'b', data: new Uint8Array([7]) }], new Date(2026, 0, 1));
    const view = new DataView(bytes.buffer);
    expect(view.getUint16(8, true)).toBe(8);
    expect(view.getUint32(18, true)).toBeLessThan(view.getUint32(22, true));
    const second = 30 + 5 + view.getUint32(18, true);
    expect(view.getUint32(second, true)).toBe(0x04034b50);
    expect(view.getUint16(second + 8, true)).toBe(0);
  });

  it('deflates PDF streams', async () => {
    withBlobStreams();
    const blob = await writePdf(buildExportTable([{ a: 'x' }], [{ field: 'a' }]), { pageNumbers: false }, { regular: TX_EXPORT_FONT.regular }, CONTEXT);
    expect(latin1(await readBlob(blob))).toContain('/Filter /FlateDecode');
  });
});

describe('pdf writer options', () => {
  const regular = base64ToBytes(TX_EXPORT_FONT.regular);
  const font = { regular };
  const text = async (table: Parameters<typeof writePdf>[0], options: Parameters<typeof writePdf>[1]) => latin1(await readBlob(await writePdf(table, { compress: false, ...options }, font, CONTEXT)));
  const pages = (pdf: string) => Number(/\/Count (\d+)/.exec(pdf)?.[1]);

  it('takes fonts as bytes or buffers', async () => {
    const bold = base64ToBytes(TX_EXPORT_FONT.bold);
    const blob = await writePdf(buildExportTable([{ a: 'x' }], [{ field: 'a' }]), { compress: false }, { regular, bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength) as ArrayBuffer }, CONTEXT);
    const pdf = latin1(await readBlob(blob));
    expect(pdf).toContain('/BaseFont /TXREGU+Onest-Regular');
    expect(pdf).toContain('/BaseFont /TXBOLD+Onest-SemiBold');
  });

  it('writes a page without columns', async () => {
    const pdf = await text(buildExportTable([{ a: 1 }], []), {});
    expect(pages(pdf)).toBe(1);
    expect(pdf).not.toContain('/F1 9 Tf');
  });

  it('scales fixed columns that do not fit the page', async () => {
    const pdf = await text(buildExportTable([{ a: 1, b: 2, c: 3 }], [{ field: 'a', width: 200 }, { field: 'b', width: 200 }, { field: 'c', width: 200 }]), { pageNumbers: false });
    expect(pdf).toMatch(/\n210\.43 [\d.]+ m 210\.43 /);
    expect(pdf).toMatch(/\n384\.85 [\d.]+ m 384\.85 /);
  });

  it('keeps fixed columns and shares the rest of the row', async () => {
    const pdf = await text(buildExportTable([{ a: 1, b: 'x' }], [{ field: 'a', width: 10 }, { field: 'b' }]), { pageNumbers: false });
    expect(pdf).toMatch(/\n93\.5 [\d.]+ m 93\.5 /);
  });

  it('gives narrow columns a floor and wraps the wide ones', async () => {
    const long = 'tectra '.repeat(60);
    const table = buildExportTable([{ id: 'x', a: long, b: long, c: long, fixed: 1 }], [{ field: 'id' }, { field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'fixed', width: 5 }]);
    const pdf = await text(table, { pageNumbers: false, header: false });
    const xs = [...pdf.matchAll(/\n([\d.]+) [\d.]+ m \1 [\d.]+ l S/g)].map((match) => Number(match[1]));
    expect(xs[0]).toBe(36);
    expect(xs.at(-1)).toBeCloseTo(559.28, 1);
    expect(xs[1] - xs[0]).toBeGreaterThan(40);
    expect((pdf.match(/ Tj ET/g) ?? []).length).toBeGreaterThan(10);
    const even = await text(buildExportTable([{ a: long, b: long, c: long }], [{ field: 'a' }, { field: 'b' }, { field: 'c' }]), { pageNumbers: false, header: false });
    const evenXs = [...even.matchAll(/\n([\d.]+) [\d.]+ m \1 [\d.]+ l S/g)].map((match) => Number(match[1]));
    expect(evenXs.slice(0, 4)).toEqual([36, 210.43, 384.85, 559.28]);
  });

  it('draws stripes, centered cells and gaps without a header fill, gridlines or a repeated header', async () => {
    const rows = Array.from({ length: 90 }, (_, index) => ({ id: index, flag: index % 2 === 0, note: index % 3 ? 'x' : '' }));
    const table = buildExportTable(rows, [{ field: 'id' }, { field: 'flag' }, { field: 'note' }]);
    const pdf = await text(table, { headerBackground: 'none', striped: true, gridlines: false, repeatHeader: false, pageNumbers: false });
    expect(pages(pdf)).toBeGreaterThan(1);
    expect(pdf).not.toContain('0.949 0.957 0.969 rg');
    expect(pdf).toContain('0.976 0.98 0.984 rg');
    expect(pdf).not.toMatch(/\n([\d.]+) [\d.]+ m \1 [\d.]+ l S/);
    expect((pdf.match(/2 Tr/g) ?? []).length).toBe(3);
  });

  it('starts pages with a rule when the header is off', async () => {
    const rows = Array.from({ length: 90 }, (_, index) => ({ id: index }));
    const pdf = await text(buildExportTable(rows, [{ field: 'id' }]), { header: false, title: 'T', pageNumbers: false });
    expect(pages(pdf)).toBeGreaterThan(1);
    expect((pdf.match(/2 Tr/g) ?? []).length).toBe(1);
    const firstPage = pdf.split('endstream')[0];
    expect(firstPage).toContain('RG 0.5 w 36');
  });
});

describe('word writer options', () => {
  it('writes multi-line cells, a date line and fixed widths without a header fill', () => {
    const table = buildExportTable([{ a: 'one\ntwo', b: 'x' }], [{ field: 'a', title: 'A', width: 30 }, { field: 'b', title: 'B', align: 'center' }]);
    const xml = docxDocument(table, { headerBackground: 'none', repeatHeader: false, showDate: true }, CONTEXT, new Date(2026, 0, 2, 3, 4));
    expect(xml).toContain('<w:t xml:space="preserve">one</w:t><w:br/><w:t xml:space="preserve">two</w:t>');
    expect(xml).toMatch(/Jan 2, 2026, 3:04\sAM/);
    expect(xml).not.toContain('w:fill="F2F4F7"');
    expect(xml).not.toContain('<w:tblHeader/>');
    expect(xml).toContain('<w:jc w:val="center"/>');
    expect(xml).toContain('<w:gridCol w:w="9234"/><w:gridCol w:w="1231"/>');
  });

  it('leaves the table out without columns', () => {
    const xml = docxDocument(buildExportTable([{ a: 1 }], []), {}, CONTEXT, new Date());
    expect(xml).not.toContain('<w:tbl>');
    expect(xml).toContain('<w:body><w:p/><w:sectPr>');
  });

  it('packs a titled document without page numbers', async () => {
    const text = latin1(await readBlob(await writeDocx(buildExportTable([{ a: 1 }], [{ field: 'a' }]), { title: 'Report', pageNumbers: false, compress: false })));
    expect(text).toContain('<dc:title>Report</dc:title>');
    expect(text).not.toContain('word/footer1.xml');
    expect(text).not.toContain('footer+xml');
    expect(text).toContain(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);
  });
});

describe('excel writer options', () => {
  it('styles the header without bold or fill and with an own colour', () => {
    const { styles } = xlsxParts(buildExportTable([{ a: 1 }], [{ field: 'a' }]), { headerColor: '#123456', headerBold: false, headerBackground: 'none' });
    expect(styles).toContain('<color rgb="FF123456"/>');
    expect(styles).not.toContain('<b/>');
    expect(styles).toContain('<fills count="2">');
    expect(styles).toContain('fontId="1" fillId="0"');
  });

  it('writes empty, date-time, boolean, numeric text and object cells', () => {
    const table = buildExportTable(
      [
        { when: new Date(2026, 0, 5, 9, 30), day: new Date(2026, 0, 5), ok: true, amount: ' 12.5 ', plain: 3, data: { a: 1 }, note: 'a\nb', empty: '' },
        { when: null, day: 'nope', ok: false, amount: 'n/a', plain: Number.NaN, data: [1], note: 'c', empty: null },
      ],
      [
        { field: 'when', type: 'datetime' },
        { field: 'day', type: 'date' },
        { field: 'ok', type: 'boolean', align: 'start' },
        { field: 'amount', type: 'number' },
        { field: 'plain', align: 'start' },
        { field: 'data' },
        { field: 'note' },
        { field: 'empty' },
      ],
    );
    const { sheet, styles } = xlsxParts(table, { dateTimeFormat: 'dd.mm.yyyy hh:mm', wrapText: false, header: false });
    expect(sheet).toMatch(/<c r="A1" s="\d+"><v>46027\.395833/);
    expect(styles).toContain('formatCode="dd.mm.yyyy hh:mm"');
    expect(sheet).toMatch(/<c r="B1" s="\d+"><v>46027<\/v><\/c>/);
    expect(styles).toContain('numFmtId="14"');
    expect(sheet).toContain('<c r="C1" t="b"><v>1</v></c>');
    expect(sheet).toMatch(/<c r="D1" s="\d+"><v>12\.5<\/v><\/c>/);
    expect(sheet).toContain('<c r="E1"><v>3</v></c>');
    expect(sheet).toContain('<c r="F1" t="inlineStr"><is><t xml:space="preserve">{&quot;a&quot;:1}</t></is></c>');
    expect(sheet).toContain('<c r="G1" t="inlineStr"><is><t xml:space="preserve">a\nb</t></is></c>');
    expect(sheet).not.toContain('r="H1"');
    expect(sheet).not.toContain('r="A2"');
    expect(sheet).toContain('<c r="B2" t="inlineStr"><is><t xml:space="preserve">nope</t></is></c>');
    expect(sheet).toMatch(/<c r="D2" t="inlineStr" s="\d+"><is><t xml:space="preserve">n\/a<\/t>/);
    expect(sheet).toContain('<c r="E2" t="inlineStr"><is><t xml:space="preserve">NaN</t></is></c>');
    expect(sheet).toContain('<t xml:space="preserve">[1]</t>');
    expect(excelWidths(table)).toEqual([18, 18, 8, 8, 8, 17, 8, 8]);
  });

  it('writes a sheet without columns', () => {
    const { sheet } = xlsxParts(buildExportTable([], []));
    expect(sheet).not.toContain('<cols>');
    expect(sheet).not.toContain('autoFilter');
  });

  it('packs the title and author into the document properties', async () => {
    const text = latin1(await readBlob(await writeXlsx(buildExportTable([{ a: 1 }], [{ field: 'a' }]), { title: 'Sales', author: 'Ada', compress: false })));
    expect(text).toContain('<dc:title>Sales</dc:title><dc:creator>Ada</dc:creator>');
  });
});
