import { TX_EXPORT_FONT } from '@tectra-ng/ui/export-font';
import { buildExportTable } from './export.utils';
import { base64ToBytes } from './writers/bytes';
import { docxDocument, writeDocx } from './writers/docx';
import { pageGeometry } from './writers/page';
import { wrapText, writePdf } from './writers/pdf';
import { parseTrueType } from './writers/truetype';
import { columnName, excelSerial, excelWidths, sheetName, writeXlsx, xlsxParts } from './writers/xlsx';

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
