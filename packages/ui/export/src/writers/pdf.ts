import { TxExportFont, TxExportPdfOptions, TxExportTable } from '../export.types';
import { TxExportTextContext, cellText, hexColor } from '../export.utils';
import { TxPageGeometry, dateLine, pageGeometry } from './page';
import { PdfFont, assemblePdf, loadPdfFonts, num, rgb } from './pdf-core';

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

  const heading: { text: string; font: PdfFont; size: number; color: string; strong: boolean }[] = [];
  const addHeading = (value: string, strong: boolean, headingSize: number, color: string) => {
    const headingFont = strong ? bold : regular;
    for (const line of wrapText(value, available, (part) => headingFont.width(part, headingSize))) {
      heading.push({ text: line, font: headingFont, size: headingSize, color, strong });
    }
  };
  if (options.title) addHeading(options.title, true, size * 1.6, text);
  if (options.subtitle) addHeading(options.subtitle, false, size * 1.1, muted);
  const stamp = dateLine(options, context, date);
  if (stamp) addHeading(stamp, false, size * 0.9, muted);

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
        drawText(line.text, left, y, line.font, line.size, line.color, line.strong);
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

  return assemblePdf({
    width: page.width,
    height: page.height,
    pages: pages.map((pageOps) => ({ ops: pageOps, links: [] })),
    fonts: [...new Set([regular, bold])],
    title: options.title,
    author: options.author,
    compress: options.compress,
    date,
  });
}
