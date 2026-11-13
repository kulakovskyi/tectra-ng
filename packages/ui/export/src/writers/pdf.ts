import { TxExportFont, TxExportPdfOptions, TxExportTable } from '../export.types';
import { TxExportTextContext, cellText, hexColor } from '../export.utils';
import { base64ToBytes, compress, concatBytes, utf8 } from './bytes';
import { TxPageGeometry, dateLine, pageGeometry } from './page';
import { TxTrueTypeFont, parseTrueType } from './truetype';

class PdfFont {
  readonly used = new Map<number, number>();

  constructor(
    readonly ttf: TxTrueTypeFont,
    readonly resource: string,
    readonly tag: string,
  ) {}

  width(text: string, size: number): number {
    let units = 0;
    for (const char of text) units += this.ttf.advance(this.ttf.glyphId(char.codePointAt(0) ?? 0));
    return (units * size) / this.ttf.unitsPerEm;
  }

  encode(text: string): string {
    let hex = '';
    for (const char of text) {
      const code = char.codePointAt(0) ?? 0;
      const glyph = this.ttf.glyphId(code);
      if (!this.used.has(glyph)) this.used.set(glyph, code);
      hex += glyph.toString(16).padStart(4, '0');
    }
    return hex;
  }
}

function toBytes(source: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof source === 'string') return base64ToBytes(source);
  return source instanceof Uint8Array ? source : new Uint8Array(source);
}

function rgb(hex: string): string {
  const value = parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((part) => +(part / 255).toFixed(3)).join(' ');
}

function num(value: number): string {
  return (+value.toFixed(2)).toString();
}

function utf16Hex(text: string): string {
  let hex = '';
  for (let index = 0; index < text.length; index++) hex += text.charCodeAt(index).toString(16).padStart(4, '0');
  return hex;
}

function pdfString(text: string): string {
  return `<FEFF${utf16Hex(text)}>`;
}

function pdfDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/** Breaks text into lines that fit the width, measured by the given function. */
export function wrapText(text: string, width: number, measure: (text: string) => number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\t/g, ' ').split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= width) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      if (measure(word) <= width) {
        line = word;
        continue;
      }
      let part = '';
      for (const char of word) {
        if (part && measure(part + char) > width) {
          lines.push(part);
          part = '';
        }
        part += char;
      }
      line = part;
    }
    lines.push(line);
  }
  return lines;
}

interface Layout {
  widths: number[];
}

function layoutColumns(table: TxExportTable, texts: string[][], regular: PdfFont, bold: PdfFont, size: number, padding: number, available: number): Layout {
  const count = table.columns.length;
  if (!count) return { widths: [] };
  const sample = texts.slice(0, 1000);
  const natural = table.columns.map((column, index) => {
    if (column.width) return column.width * size * 0.55 + padding * 2;
    const header = Math.max(...column.title.split('\n').map((line) => bold.width(line, size)));
    const cells = sample.map((row) => Math.max(...row[index].split('\n').map((line) => regular.width(line, size))));
    return Math.min(available * 0.45, Math.max(header, ...cells, size * 2) + padding * 2);
  });
  const fixed = table.columns.map((column) => !!column.width);
  const fixedSum = natural.reduce((sum, width, index) => sum + (fixed[index] ? width : 0), 0);
  const flexSum = natural.reduce((sum, width, index) => sum + (fixed[index] ? 0 : width), 0);
  const room = available - fixedSum;
  if (room <= 0 || !flexSum) {
    const total = fixedSum + flexSum;
    return { widths: natural.map((width) => (width * available) / total) };
  }
  if (flexSum <= room) return { widths: natural.map((width, index) => (fixed[index] ? width : (width * room) / flexSum)) };
  const floor = Math.min(room / Math.max(1, fixed.filter((value) => !value).length), size * 4 + padding * 2);
  let widths = natural.map((width, index) => (fixed[index] ? width : Math.max(floor, (width * room) / flexSum)));
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total > available) widths = widths.map((width) => (width * available) / total);
  return { widths };
}

interface PdfRow {
  cells: string[][];
  height: number;
  header: boolean;
  stripe: boolean;
}

export async function loadPdfFonts(font: TxExportFont): Promise<{ regular: TxTrueTypeFont; bold: TxTrueTypeFont | null }> {
  return { regular: parseTrueType(toBytes(font.regular)), bold: font.bold ? parseTrueType(toBytes(font.bold)) : null };
}

/** Writes the table as a PDF file blob, with the glyphs it uses embedded from the font. */
export async function writePdf(
  table: TxExportTable,
  options: TxExportPdfOptions,
  font: TxExportFont,
  context: TxExportTextContext = { yes: 'Yes', no: 'No' },
  date = new Date(),
): Promise<Blob> {
  const fonts = await loadPdfFonts(font);
  const regular = new PdfFont(fonts.regular, 'F1', 'TXREGU');
  const bold = fonts.bold ? new PdfFont(fonts.bold, 'F2', 'TXBOLD') : regular;
  const fakeBold = bold === regular;
  const page: TxPageGeometry = pageGeometry(options.pageSize, options.orientation, options.margin, table.columns.length);
  const size = options.fontSize ?? 9;
  const lineHeight = size * (options.lineHeight ?? 1.35);
  const padX = options.cellPadding ?? 4;
  const padY = padX * 0.75;
  const [top, right, bottom, left] = page.margin;
  const available = page.width - left - right;
  const text = hexColor(options.textColor, '1D2939');
  const muted = hexColor(options.mutedColor, '667085');
  const border = hexColor(options.borderColor, 'D0D5DD');
  const headerFill = options.headerBackground === 'none' ? null : hexColor(options.headerBackground, 'F2F4F7');
  const stripeFill = hexColor(options.stripeBackground, 'F9FAFB');
  const texts = table.rows.map((row) => table.columns.map((column, index) => cellText(row[index], column, context)));
  const { widths } = layoutColumns(table, texts, regular, bold, size, padX, available);
  const xs = widths.reduce<number[]>((acc, width, index) => [...acc, acc[index] + width], [left]);

  const wrapRow = (values: readonly string[], measureFont: PdfFont, header: boolean, stripe: boolean): PdfRow => {
    const cells = values.map((value, index) => wrapText(value, Math.max(1, widths[index] - padX * 2), (line) => measureFont.width(line, size)));
    return { cells, header, stripe, height: Math.max(1, ...cells.map((lines) => lines.length)) * lineHeight + padY * 2 };
  };
  const headerRow = options.header === false || !table.columns.length ? null : wrapRow(table.columns.map((column) => column.title), bold, true, false);
  const bodyRows = texts.map((values, index) => wrapRow(values, regular, false, !!options.striped && index % 2 === 1));

  const heading: { text: string; font: PdfFont; size: number; color: string }[] = [];
  if (options.title) heading.push({ text: options.title, font: bold, size: size * 1.6, color: text });
  if (options.subtitle) heading.push({ text: options.subtitle, font: regular, size: size * 1.1, color: muted });
  const stamp = dateLine(options, context, date);
  if (stamp) heading.push({ text: stamp, font: regular, size: size * 0.9, color: muted });

  const pages: string[][] = [];
  let ops: string[] = [];
  let y = page.height - top;
  const ascentRatio = fonts.regular.ascent / fonts.regular.unitsPerEm;
  const descentRatio = -fonts.regular.descent / fonts.regular.unitsPerEm;

  const drawText = (value: string, x: number, baseline: number, pdfFont: PdfFont, fontSize: number, color: string, strong = false) => {
    if (!value) return;
    const effect = strong && fakeBold ? `2 Tr ${num(fontSize * 0.03)} w ${rgb(color)} RG ` : '';
    ops.push(`BT ${effect}/${pdfFont.resource} ${num(fontSize)} Tf ${rgb(color)} rg ${num(x)} ${num(baseline)} Td <${pdfFont.encode(value)}> Tj ET`);
  };

  const drawRow = (row: PdfRow) => {
    const rowTop = y;
    const fill = row.header ? headerFill : row.stripe ? stripeFill : null;
    if (fill) ops.push(`${rgb(fill)} rg ${num(left)} ${num(rowTop - row.height)} ${num(available)} ${num(row.height)} re f`);
    row.cells.forEach((lines, index) => {
      const column = table.columns[index];
      const pdfFont = row.header ? bold : regular;
      lines.forEach((line, lineIndex) => {
        const lineTop = rowTop - padY - lineIndex * lineHeight;
        const baseline = lineTop - (lineHeight - (ascentRatio + descentRatio) * size) / 2 - ascentRatio * size;
        const width = pdfFont.width(line, size);
        const cellLeft = xs[index] + padX;
        const cellWidth = widths[index] - padX * 2;
        const x = column.align === 'end' ? cellLeft + cellWidth - width : column.align === 'center' ? cellLeft + (cellWidth - width) / 2 : cellLeft;
        drawText(line, x, baseline, pdfFont, size, text, row.header);
      });
    });
    ops.push(`${rgb(border)} RG 0.5 w ${num(left)} ${num(rowTop - row.height)} m ${num(left + available)} ${num(rowTop - row.height)} l S`);
    if (options.gridlines !== false) {
      for (const x of xs) ops.push(`${num(x)} ${num(rowTop)} m ${num(x)} ${num(rowTop - row.height)} l S`);
    }
    y -= row.height;
  };

  const startPage = (first: boolean) => {
    if (!first) pages.push(ops);
    ops = [];
    y = page.height - top;
    if (first) {
      heading.forEach((line) => {
        y -= line.size * 1.25;
        drawText(line.text, left, y, line.font, line.size, line.color, line.font === bold);
      });
      if (heading.length) y -= size * 1.2;
    }
    if (headerRow && (first || options.repeatHeader !== false)) {
      ops.push(`${rgb(border)} RG 0.5 w ${num(left)} ${num(y)} m ${num(left + available)} ${num(y)} l S`);
      drawRow(headerRow);
    } else if (table.columns.length) {
      ops.push(`${rgb(border)} RG 0.5 w ${num(left)} ${num(y)} m ${num(left + available)} ${num(y)} l S`);
    }
  };

  startPage(true);
  let rowsOnPage = 0;
  for (const row of bodyRows) {
    if (y - row.height < bottom && rowsOnPage > 0) {
      startPage(false);
      rowsOnPage = 0;
    }
    drawRow(row);
    rowsOnPage++;
  }
  pages.push(ops);

  if (options.pageNumbers !== false) {
    pages.forEach((pageOps, index) => {
      ops = pageOps;
      const label = `${index + 1} / ${pages.length}`;
      const footerSize = size * 0.85;
      drawText(label, (page.width - regular.width(label, footerSize)) / 2, Math.max(12, bottom / 2 - footerSize / 2), regular, footerSize, muted);
    });
  }

  const objects: (Uint8Array | null)[] = [];
  const reserve = () => {
    objects.push(null);
    return objects.length;
  };
  const set = (id: number, body: string | Uint8Array) => {
    objects[id - 1] = typeof body === 'string' ? utf8(`${id} 0 obj\n${body}\nendobj\n`) : body;
  };
  const stream = async (id: number, dict: string, data: Uint8Array) => {
    const packed = options.compress === false ? null : await compress(data, 'deflate');
    const body = packed ?? data;
    set(id, concatBytes([utf8(`${id} 0 obj\n<< ${dict} /Length ${body.length}${packed ? ' /Filter /FlateDecode' : ''} >>\nstream\n`), body, utf8('\nendstream\nendobj\n')]));
  };

  const catalog = reserve();
  const pagesId = reserve();
  const info = reserve();
  const fontIds = new Map<PdfFont, number>();
  for (const pdfFont of new Set([regular, bold])) fontIds.set(pdfFont, reserve());
  const pageIds = pages.map(() => [reserve(), reserve()] as const);

  for (const [index, [pageId, contentId]] of pageIds.entries()) {
    const fontsDict = [...fontIds].map(([pdfFont, id]) => `/${pdfFont.resource} ${id} 0 R`).join(' ');
    set(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(page.width)} ${num(page.height)}] /Resources << /Font << ${fontsDict} >> >> /Contents ${contentId} 0 R >>`);
    await stream(contentId, '', utf8(pages[index].join('\n')));
  }

  for (const [pdfFont, id] of fontIds) {
    const ttf = pdfFont.ttf;
    const scale = (value: number) => Math.round((value * 1000) / ttf.unitsPerEm);
    const glyphs = [...pdfFont.used.keys()].sort((a, b) => a - b);
    const baseFont = `${pdfFont.tag}+${ttf.name}`;
    const cid = reserve();
    const descriptor = reserve();
    const file = reserve();
    const toUnicode = reserve();
    set(id, `<< /Type /Font /Subtype /Type0 /BaseFont /${baseFont} /Encoding /Identity-H /DescendantFonts [${cid} 0 R] /ToUnicode ${toUnicode} 0 R >>`);
    const w = glyphs.map((glyph) => `${glyph} [${scale(ttf.advance(glyph))}]`).join(' ');
    set(cid, `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${baseFont} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /DW ${scale(ttf.advance(0))} /W [${w}] /CIDToGIDMap /Identity >>`);
    set(
      descriptor,
      `<< /Type /FontDescriptor /FontName /${baseFont} /Flags 32 /FontBBox [${ttf.bbox.map(scale).join(' ')}] /ItalicAngle 0 /Ascent ${scale(ttf.ascent)} /Descent ${scale(ttf.descent)} /CapHeight ${scale(ttf.capHeight)} /StemV 80 /FontFile2 ${file} 0 R >>`,
    );
    const subset = ttf.subset(new Set(glyphs));
    await stream(file, `/Length1 ${subset.length}`, subset);
    const entries = glyphs.map((glyph) => `<${glyph.toString(16).padStart(4, '0')}> <${utf16Hex(String.fromCodePoint(pdfFont.used.get(glyph) ?? 0xfffd))}>`);
    const chunks: string[] = [];
    for (let index = 0; index < entries.length; index += 100) {
      const chunk = entries.slice(index, index + 100);
      chunks.push(`${chunk.length} beginbfchar\n${chunk.join('\n')}\nendbfchar`);
    }
    const cmap = `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${chunks.join('\n')}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    await stream(toUnicode, '', utf8(cmap));
  }

  set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  set(pagesId, `<< /Type /Pages /Kids [${pageIds.map(([pageId]) => `${pageId} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const infoParts = [`/Producer (tectra)`, `/CreationDate (${pdfDate(date)})`];
  if (options.title) infoParts.push(`/Title ${pdfString(options.title)}`);
  if (options.author) infoParts.push(`/Author ${pdfString(options.author)}`);
  set(info, `<< ${infoParts.join(' ')} >>`);

  const header = utf8('%PDF-1.7\n%âãÏÓ\n');
  const offsets: number[] = [];
  let offset = header.length;
  for (const object of objects) {
    offsets.push(offset);
    offset += (object as Uint8Array).length;
  }
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.map((value) => `${String(value).padStart(10, '0')} 00000 n \n`)].join('');
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
  const bytes = concatBytes([header, ...(objects as Uint8Array[]), utf8(xref + trailer)]);
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
