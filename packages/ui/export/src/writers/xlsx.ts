import { TxExportColumn, TxExportExcelOptions, TxExportTable } from '../export.types';
import { escapeXml, hexColor, toDate } from '../export.utils';
import { zip } from './zip';

const MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
const NUMBER = /^[+-]?\d+(\.\d+)?$/;
const MAX_TEXT = 32767;

export function columnName(index: number): string {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
}

export function excelSerial(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  return local / 86400000 + 25569;
}

export function sheetName(name: string | undefined): string {
  const clean = (name ?? '').replace(/[[\]:*?/\\]/g, ' ').replace(/^'+|'+$/g, '').trim().slice(0, 31);
  return clean || 'Sheet1';
}

interface StyleKey {
  numFmt: number;
  align?: string;
  wrap: boolean;
  header: boolean;
}

class StyleBook {
  private readonly formats = new Map<string, number>();
  private readonly xfs: StyleKey[] = [{ numFmt: 0, wrap: false, header: false }];

  numFmt(code: string | undefined, builtin: number): number {
    if (!code) return builtin;
    let id = this.formats.get(code);
    if (id === undefined) {
      id = 164 + this.formats.size;
      this.formats.set(code, id);
    }
    return id;
  }

  xf(key: StyleKey): number {
    const index = this.xfs.findIndex((xf) => xf.numFmt === key.numFmt && xf.align === key.align && xf.wrap === key.wrap && xf.header === key.header);
    if (index >= 0) return index;
    this.xfs.push(key);
    return this.xfs.length - 1;
  }

  xml(options: TxExportExcelOptions): string {
    const formats = [...this.formats].map(([code, id]) => `<numFmt numFmtId="${id}" formatCode="${escapeXml(code)}"/>`).join('');
    const headerColor = options.headerColor ? `<color rgb="FF${hexColor(options.headerColor, '000000')}"/>` : '';
    const bold = options.headerBold === false ? '' : '<b/>';
    const fill = options.headerBackground === 'none' ? '' : `<fill><patternFill patternType="solid"><fgColor rgb="FF${hexColor(options.headerBackground, 'F2F2F2')}"/><bgColor indexed="64"/></patternFill></fill>`;
    const xfs = this.xfs
      .map((xf) => {
        const alignment = xf.align || xf.wrap ? `<alignment${xf.align ? ` horizontal="${xf.align}"` : ''}${xf.wrap ? ' wrapText="1" vertical="top"' : ''}/>` : '';
        const attrs = `numFmtId="${xf.numFmt}" fontId="${xf.header ? 1 : 0}" fillId="${xf.header && fill ? 2 : 0}" borderId="0" xfId="0"${xf.numFmt ? ' applyNumberFormat="1"' : ''}${xf.header ? ' applyFont="1" applyFill="1"' : ''}${alignment ? ' applyAlignment="1"' : ''}`;
        return alignment ? `<xf ${attrs}>${alignment}</xf>` : `<xf ${attrs}/>`;
      })
      .join('');
    return (
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="${MAIN}">` +
      (this.formats.size ? `<numFmts count="${this.formats.size}">${formats}</numFmts>` : '') +
      `<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font>${bold}<sz val="11"/>${headerColor}<name val="Calibri"/><family val="2"/></font></fonts>` +
      `<fills count="${fill ? 3 : 2}"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${fill}</fills>` +
      `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
      `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
      `<cellXfs count="${this.xfs.length}">${xfs}</cellXfs>` +
      `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
    );
  }
}

function horizontal(column: TxExportColumn): string | undefined {
  return column.align === 'end' ? 'right' : column.align === 'center' ? 'center' : undefined;
}

function textLength(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const text = value instanceof Date ? '0000-00-00 00:00' : String(value);
  return Math.max(...text.split('\n').map((line) => line.length));
}

export function excelWidths(table: TxExportTable, options: TxExportExcelOptions = {}): number[] {
  const min = options.minWidth ?? 8;
  const max = options.maxWidth ?? 60;
  return table.columns.map((column, index) => {
    if (column.width) return column.width;
    if (options.autoWidth === false) return min + 2;
    const longest = Math.max(textLength(column.title), ...table.rows.slice(0, 1000).map((row) => textLength(row[index])));
    return Math.min(max, Math.max(min, longest + 2));
  });
}

function cell(ref: string, value: unknown, column: TxExportColumn, styles: StyleBook, options: TxExportExcelOptions): string {
  if (value === null || value === undefined || value === '') return '';
  const align = horizontal(column);
  if (column.type === 'date' || column.type === 'datetime' || value instanceof Date) {
    const date = toDate(value);
    if (date) {
      const datetime = column.type === 'datetime';
      const fmt = styles.numFmt(column.format ?? (datetime ? options.dateTimeFormat : options.dateFormat), datetime ? 22 : 14);
      return `<c r="${ref}" s="${styles.xf({ numFmt: fmt, align, wrap: false, header: false })}"><v>${excelSerial(date)}</v></c>`;
    }
  }
  if (typeof value === 'boolean') return `<c r="${ref}" t="b"${align ? ` s="${styles.xf({ numFmt: 0, align, wrap: false, header: false })}"` : ''}><v>${value ? 1 : 0}</v></c>`;
  const numeric = typeof value === 'number' ? value : column.type === 'number' && typeof value === 'string' && NUMBER.test(value.trim()) ? Number(value) : null;
  if (numeric !== null && Number.isFinite(numeric)) {
    const fmt = styles.numFmt(column.format ?? options.numberFormat, 0);
    const style = fmt || align ? ` s="${styles.xf({ numFmt: fmt, align, wrap: false, header: false })}"` : '';
    return `<c r="${ref}"${style}><v>${numeric}</v></c>`;
  }
  const text = (typeof value === 'object' ? JSON.stringify(value) : String(value)).slice(0, MAX_TEXT);
  const wrap = options.wrapText !== false && text.includes('\n');
  const style = align || wrap ? ` s="${styles.xf({ numFmt: 0, align, wrap, header: false })}"` : '';
  return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(text)}</t></is></c>`;
}

function xlsxSheet(table: TxExportTable, options: TxExportExcelOptions, styles: StyleBook): string {
  const header = options.header !== false;
  const widths = excelWidths(table, options);
  const lastColumn = columnName(Math.max(0, table.columns.length - 1));
  const lastRow = table.rows.length + (header ? 1 : 0);
  const rows: string[] = [];
  if (header) {
    const cells = table.columns
      .map((column, index) => {
        const style = styles.xf({ numFmt: 0, align: horizontal(column), wrap: false, header: true });
        return `<c r="${columnName(index)}1" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(column.title)}</t></is></c>`;
      })
      .join('');
    rows.push(`<row r="1">${cells}</row>`);
  }
  table.rows.forEach((row, rowIndex) => {
    const r = rowIndex + (header ? 2 : 1);
    rows.push(`<row r="${r}">${table.columns.map((column, index) => cell(`${columnName(index)}${r}`, row[index], column, styles, options)).join('')}</row>`);
  });
  const freeze = header && options.freezeHeader !== false ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/></sheetView></sheetViews>' : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
  const cols = table.columns.length ? `<cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols>` : '';
  const filter = header && options.autoFilter !== false && table.columns.length ? `<autoFilter ref="A1:${lastColumn}${Math.max(1, lastRow)}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="${MAIN}" xmlns:r="${REL}">${freeze}<sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${rows.join('')}</sheetData>${filter}</worksheet>`;
}

export function xlsxParts(table: TxExportTable, options: TxExportExcelOptions = {}): { sheet: string; styles: string; sheetName: string } {
  const styles = new StyleBook();
  const sheet = xlsxSheet(table, options, styles);
  return { sheet, styles: styles.xml(options), sheetName: sheetName(options.sheetName) };
}

export async function writeXlsx(table: TxExportTable, options: TxExportExcelOptions = {}, date = new Date()): Promise<Blob> {
  const { sheet, styles, sheetName: name } = xlsxParts(table, options);
  const created = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const core =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    (options.title ? `<dc:title>${escapeXml(options.title)}</dc:title>` : '') +
    (options.author ? `<dc:creator>${escapeXml(options.author)}</dc:creator>` : '') +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created></cp:coreProperties>`;
  const bytes = await zip(
    [
      {
        name: '[Content_Types].xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      },
      {
        name: '_rels/.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${PKG_REL}"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      },
      { name: 'docProps/core.xml', data: core },
      {
        name: 'xl/workbook.xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="${MAIN}" xmlns:r="${REL}"><bookViews><workbookView/></bookViews><sheets><sheet name="${escapeXml(name)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${PKG_REL}"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>`,
      },
      { name: 'xl/worksheets/sheet1.xml', data: sheet },
      { name: 'xl/styles.xml', data: styles },
    ],
    date,
    options.compress !== false,
  );
  return new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
