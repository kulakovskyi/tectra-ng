import { TxExportHtmlPdfOptions } from '../export.types';
import { hexColor } from '../export.utils';
import { loadDefaultExportFont } from './default-font';
import { BLOCK_TAG, HtmlElement, HtmlNode, SKIPPED_TAGS, parseHtml, readDom } from './html-parse';
import { pageGeometry } from './page';
import { PdfFont, PdfPage, assemblePdf, loadOptionalFont, loadPdfFonts, num, rgb } from './pdf-core';

type Align = 'start' | 'center' | 'end';

interface InlineStyle {
  bold: boolean;
  italic: boolean;
  code: boolean;
  block: boolean;
  underline: boolean;
  strike: boolean;
  link: string | null;
  color: string | null;
  scale: number;
  rise: number;
}

interface Run {
  text: string;
  style: InlineStyle;
  brk?: 'hard' | 'soft';
}

interface Piece {
  text: string;
  style: InlineStyle;
  width: number;
  size: number;
  space: boolean;
}

interface Line {
  pieces: Piece[];
  width: number;
  height: number;
  size: number;
}

interface Frame {
  left: number;
  width: number;
  bars: readonly number[];
  align: Align;
}

interface Item {
  height: number;
  draw(page: PdfPage, top: number): void;
  space?: boolean;
  keep?: boolean;
  pageBreak?: boolean;
  split?(room: number): [Item, Item] | null;
  header?: readonly Item[];
}

interface Marker {
  label: string | null;
  depth: number;
  right: number;
}

interface Cell {
  runs: Run[];
  header: boolean;
  span: number;
  align: Align;
}

interface CellLayout {
  lines: Line[];
  x: number;
  width: number;
  align: Align;
  header: boolean;
}

interface Fonts {
  regular: PdfFont;
  bold: PdfFont;
  italic: PdfFont | null;
  mono: PdfFont | null;
  fakeBold: boolean;
  ascent: number;
  descent: number;
}

const PLAIN: InlineStyle = { bold: false, italic: false, code: false, block: false, underline: false, strike: false, link: null, color: null, scale: 1, rise: 0 };
const HEADING_SCALE = [2, 1.6, 1.35, 1.15, 1, 0.9];
const FLOW_PARTS = new Set(['li', 'dt', 'dd', 'html', 'body', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th']);
const TABLE_TAG = /^table$/;
const LINK_SCHEMES = /^(https?:|mailto:|tel:)/i;

function isFlow(tag: string): boolean {
  return BLOCK_TAG.test(tag) || FLOW_PARTS.has(tag);
}

function styleOf(element: HtmlElement): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of (element.attrs['style'] ?? '').split(';')) {
    const colon = part.indexOf(':');
    if (colon > 0) result[part.slice(0, colon).trim().toLowerCase()] = part.slice(colon + 1).trim().toLowerCase();
  }
  return result;
}

function alignOf(element: HtmlElement, fallback: Align): Align {
  const value = styleOf(element)['text-align'] ?? element.attrs['align']?.toLowerCase();
  if (value === 'center') return 'center';
  if (value === 'right' || value === 'end') return 'end';
  if (value === 'left' || value === 'start' || value === 'justify') return 'start';
  return fallback;
}

function breaks(element: HtmlElement, side: 'before' | 'after'): boolean {
  const css = styleOf(element);
  return ['page', 'always'].includes(css[`break-${side}`] ?? css[`page-break-${side}`] ?? '');
}

function inlineStyle(element: HtmlElement, style: InlineStyle, linkColor: string): InlineStyle {
  const css = styleOf(element);
  const next = { ...style };
  switch (element.tag) {
    case 'b':
    case 'strong':
      next.bold = true;
      break;
    case 'i':
    case 'em':
    case 'cite':
    case 'dfn':
    case 'var':
      next.italic = true;
      break;
    case 'code':
    case 'kbd':
    case 'samp':
    case 'tt':
      next.code = true;
      break;
    case 'u':
    case 'ins':
      next.underline = true;
      break;
    case 's':
    case 'strike':
    case 'del':
      next.strike = true;
      break;
    case 'small':
      next.scale = style.scale * 0.85;
      break;
    case 'sub':
    case 'sup':
      next.scale = style.scale * 0.75;
      next.rise = element.tag === 'sup' ? 0.35 : -0.15;
      break;
    case 'a': {
      const href = element.attrs['href'] ?? '';
      if (LINK_SCHEMES.test(href)) {
        next.link = href;
        next.underline = true;
        next.color = linkColor;
      }
      break;
    }
  }
  const weight = css['font-weight'];
  if (/^bold/.test(weight ?? '') || Number(weight) >= 600) next.bold = true;
  if (/^(?:italic|oblique)/.test(css['font-style'] ?? '')) next.italic = true;
  if (/underline/.test(css['text-decoration'] ?? '')) next.underline = true;
  if (/line-through/.test(css['text-decoration'] ?? '')) next.strike = true;
  return next;
}

function sameStyle(a: InlineStyle, b: InlineStyle): boolean {
  return (Object.keys(a) as (keyof InlineStyle)[]).every((key) => a[key] === b[key]);
}

class HtmlPdfLayout {
  readonly items: Item[] = [];
  private pending = 0;
  private fresh = true;
  private marker: Marker | null = null;
  private depth = 0;
  readonly size: number;
  private readonly lineFactor: number;
  private readonly text: string;
  private readonly muted: string;
  private readonly link: string;
  private readonly border: string;
  private readonly headerFill: string | null;
  private readonly codeFill: string;

  constructor(
    private readonly fonts: Fonts,
    options: TxExportHtmlPdfOptions,
  ) {
    this.size = options.fontSize ?? 10;
    this.lineFactor = options.lineHeight ?? 1.45;
    this.text = hexColor(options.textColor, '1D2939');
    this.muted = hexColor(options.mutedColor, '667085');
    this.link = hexColor(options.linkColor, '2560E4');
    this.border = hexColor(options.borderColor, 'D0D5DD');
    this.headerFill = options.headerBackground === 'none' ? null : hexColor(options.headerBackground, 'F2F4F7');
    this.codeFill = hexColor(options.codeBackground, 'F2F4F7');
  }

  flow(nodes: readonly HtmlNode[], frame: Frame, style: InlineStyle, pre = false): void {
    let runs: Run[] = [];
    const flush = () => {
      this.paragraph(runs, frame, pre);
      runs = [];
    };
    for (const node of nodes) {
      if (typeof node === 'string') {
        runs.push({ text: node, style });
      } else if (SKIPPED_TAGS.has(node.tag)) {
        continue;
      } else if (isFlow(node.tag)) {
        flush();
        this.block(node, frame, style);
      } else {
        this.inline(node, style, runs);
      }
    }
    flush();
  }

  private inline(element: HtmlElement, style: InlineStyle, runs: Run[]): void {
    if (SKIPPED_TAGS.has(element.tag)) return;
    if (element.tag === 'br') {
      runs.push({ text: '', style, brk: 'hard' });
      return;
    }
    if (element.tag === 'img') {
      const alt = element.attrs['alt']?.trim();
      if (alt) runs.push({ text: alt, style: { ...style, italic: true } });
      return;
    }
    const cell = element.tag === 'td' || element.tag === 'th';
    const block = isFlow(element.tag) && !cell;
    const next = isFlow(element.tag) ? style : inlineStyle(element, style, this.link);
    if (block) runs.push({ text: '', style, brk: 'soft' });
    if (element.tag === 'li') runs.push({ text: '• ', style });
    if (element.tag === 'q') runs.push({ text: '“', style });
    for (const child of element.children) {
      if (typeof child === 'string') runs.push({ text: child, style: next });
      else this.inline(child, next, runs);
    }
    if (element.tag === 'q') runs.push({ text: '”', style });
    if (block) runs.push({ text: '', style, brk: 'soft' });
    if (cell) runs.push({ text: ' ', style });
  }

  private block(element: HtmlElement, frame: Frame, style: InlineStyle): void {
    if (breaks(element, 'before')) this.pageBreak();
    const aligned = { ...frame, align: alignOf(element, frame.align) };
    const size = this.size;
    const tag = element.tag;
    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      this.gap(size * (1.5 - level * 0.08));
      this.paragraph(this.runs(element.children, { ...style, bold: true, scale: HEADING_SCALE[level - 1] }), aligned, false, true);
      this.gap(size * 0.5);
    } else if (tag === 'p' || tag === 'figure' || tag === 'dl' || tag === 'details' || tag === 'fieldset') {
      this.gap(size * 0.75);
      this.flow(element.children, aligned, style);
      this.gap(size * 0.75);
    } else if (tag === 'ul' || tag === 'ol' || tag === 'menu') {
      this.list(element, aligned, style);
    } else if (tag === 'li') {
      this.listItem(element, aligned, style, 16, null);
    } else if (tag === 'dt') {
      this.gap(size * 0.4);
      this.flow(element.children, aligned, { ...style, bold: true });
    } else if (tag === 'dd') {
      this.flow(element.children, { ...aligned, left: frame.left + 18, width: frame.width - 18 }, style);
    } else if (tag === 'figcaption' || tag === 'caption') {
      this.flow(element.children, aligned, { ...style, color: this.muted, scale: style.scale * 0.9 });
    } else if (tag === 'blockquote') {
      this.gap(size * 0.75);
      this.open(frame);
      this.flow(element.children, { ...aligned, left: frame.left + 14, width: frame.width - 14, bars: [...frame.bars, frame.left + 2] }, { ...style, color: this.muted });
      this.gap(size * 0.75);
    } else if (tag === 'pre') {
      this.code(element, frame, style);
    } else if (tag === 'hr') {
      this.rule(frame);
    } else if (TABLE_TAG.test(tag)) {
      this.table(element, aligned, style);
    } else {
      this.flow(element.children, aligned, style);
    }
    if (breaks(element, 'after')) this.pageBreak();
  }

  private runs(nodes: readonly HtmlNode[], style: InlineStyle): Run[] {
    const runs: Run[] = [];
    for (const node of nodes) {
      if (typeof node === 'string') runs.push({ text: node, style });
      else this.inline(node, style, runs);
    }
    return runs;
  }

  private gap(value: number): void {
    if (!this.fresh) this.pending = Math.max(this.pending, value);
  }

  private open(frame: Frame): void {
    this.flushGap(frame);
    this.fresh = true;
  }

  private flushGap(frame: Frame): void {
    if (this.pending > 0) this.items.push(this.spaceItem(this.pending, frame.bars));
    this.pending = 0;
  }

  private emit(item: Item, frame: Frame): void {
    this.flushGap(frame);
    this.fresh = false;
    this.items.push(item);
  }

  private pageBreak(): void {
    this.pending = 0;
    this.fresh = true;
    this.items.push({ ...this.spaceItem(0, []), space: false, pageBreak: true });
  }

  private spaceItem(height: number, bars: readonly number[]): Item {
    return { height, space: true, draw: (page, top) => this.drawBars(page, bars, top, height) };
  }

  private drawBars(page: PdfPage, bars: readonly number[], top: number, height: number): void {
    for (const x of bars) page.ops.push(`${rgb(this.border)} rg ${num(x)} ${num(top - height)} 3 ${num(height)} re f`);
  }

  private fontOf(style: InlineStyle): { font: PdfFont; fakeBold: boolean; slant: boolean } {
    const { regular, bold, italic, mono, fakeBold } = this.fonts;
    if (style.code && mono) return { font: mono, fakeBold: false, slant: style.italic };
    if (style.bold) return { font: bold, fakeBold, slant: style.italic };
    if (style.italic) return italic ? { font: italic, fakeBold: false, slant: false } : { font: regular, fakeBold: false, slant: true };
    return { font: regular, fakeBold: false, slant: false };
  }

  private pieceSize(style: InlineStyle): number {
    return this.size * style.scale * (style.code ? 0.9 : 1);
  }

  private piece(text: string, style: InlineStyle, space: boolean): Piece {
    const size = this.pieceSize(style);
    return { text, style, size, space, width: this.fontOf(style).font.width(text, size) };
  }

  private tokens(runs: readonly Run[], pre: boolean): (Piece | 'hard' | 'soft')[] {
    const tokens: (Piece | 'hard' | 'soft')[] = [];
    for (const run of runs) {
      if (run.brk) {
        tokens.push(run.brk);
        continue;
      }
      const parts = pre ? run.text.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n') : [run.text.replace(/[ \t\n\r\f]+/g, ' ')];
      parts.forEach((part, index) => {
        if (index > 0) tokens.push('hard');
        for (const word of part.split(pre ? /( +)/ : /( )/)) {
          if (word) tokens.push(this.piece(word, run.style, word.trim() === ''));
        }
      });
    }
    return tokens;
  }

  layout(runs: readonly Run[], width: number, pre: boolean): Line[] {
    const lines: Line[] = [];
    let pieces: Piece[] = [];
    let x = 0;
    const push = (force: boolean) => {
      if (!pre) {
        while (pieces.length && pieces[pieces.length - 1].space) x -= (pieces.pop() as Piece).width;
      }
      if (!pieces.length && !force) return;
      const size = Math.max(this.size * (pre ? 0.9 : 1), ...pieces.map((piece) => piece.size));
      lines.push({ pieces, width: x, size, height: size * this.lineFactor });
      pieces = [];
      x = 0;
    };
    for (const token of this.tokens(runs, pre)) {
      if (token === 'hard' || token === 'soft') {
        push(token === 'hard');
        continue;
      }
      if (token.space && !pre && (!pieces.length || pieces[pieces.length - 1].space)) continue;
      if (x + token.width > width && pieces.some((piece) => !piece.space)) {
        push(true);
        if (token.space && !pre) continue;
      }
      if (token.width > width && !token.space) {
        let part = '';
        for (const char of token.text) {
          const next = part + char;
          if (part && x + this.piece(next, token.style, false).width > width) {
            const piece = this.piece(part, token.style, false);
            pieces.push(piece);
            x += piece.width;
            push(true);
            part = char;
          } else {
            part = next;
          }
        }
        const rest = this.piece(part, token.style, false);
        pieces.push(rest);
        x += rest.width;
        continue;
      }
      pieces.push(token);
      x += token.width;
    }
    push(false);
    return lines;
  }

  private paragraph(runs: readonly Run[], frame: Frame, pre: boolean, keep = false, fill: string | null = null, inset = 0): void {
    const lines = this.layout(runs, frame.width - inset * 2, pre);
    lines.forEach((line, index) => {
      const marker = this.marker;
      this.marker = null;
      this.emit(
        {
          height: line.height,
          keep: keep && index === lines.length - 1,
          draw: (page, top) => {
            if (fill) page.ops.push(`${rgb(fill)} rg ${num(frame.left)} ${num(top - line.height)} ${num(frame.width)} ${num(line.height)} re f`);
            this.drawBars(page, frame.bars, top, line.height);
            const baseline = this.drawLine(page, line, frame, top, inset);
            if (marker) this.drawMarker(page, marker, baseline);
          },
        },
        frame,
      );
    });
  }

  private baseline(line: Line, top: number): number {
    const { ascent, descent } = this.fonts;
    return top - (line.height - (ascent + descent) * line.size) / 2 - ascent * line.size;
  }

  private drawLine(page: PdfPage, line: Line, frame: Frame, top: number, inset: number): number {
    const baseline = this.baseline(line, top);
    const room = frame.width - inset * 2;
    let x = frame.left + inset + (frame.align === 'center' ? (room - line.width) / 2 : frame.align === 'end' ? room - line.width : 0);
    const segments: Piece[] = [];
    for (const piece of line.pieces) {
      const last = segments[segments.length - 1];
      if (last && sameStyle(last.style, piece.style)) segments[segments.length - 1] = { ...last, text: last.text + piece.text, width: last.width + piece.width };
      else segments.push(piece);
    }
    for (const segment of segments) {
      this.drawSegment(page, segment, x, baseline);
      x += segment.width;
    }
    return baseline;
  }

  private drawSegment(page: PdfPage, piece: Piece, x: number, baseline: number): void {
    const { style, size, width } = piece;
    const { ascent, descent } = this.fonts;
    const y = baseline + style.rise * this.size;
    const color = style.color ?? this.text;
    if (style.code && !style.block) page.ops.push(`${rgb(this.codeFill)} rg ${num(x - 1.5)} ${num(y - descent * size)} ${num(width + 3)} ${num((ascent + descent) * size)} re f`);
    const { font, fakeBold, slant } = this.fontOf(style);
    const effect = fakeBold ? `2 Tr ${num(size * 0.03)} w ${rgb(color)} RG ` : '';
    const position = slant ? `1 0 0.2 1 ${num(x)} ${num(y)} Tm` : `${num(x)} ${num(y)} Td`;
    page.ops.push(`q BT ${effect}/${font.resource} ${num(size)} Tf ${rgb(color)} rg ${position} <${font.encode(piece.text)}> Tj ET Q`);
    const stroke = (offset: number) => page.ops.push(`${rgb(color)} RG ${num(size * 0.06)} w ${num(x)} ${num(y + offset)} m ${num(x + width)} ${num(y + offset)} l S`);
    if (style.underline) stroke(-size * 0.12);
    if (style.strike) stroke(size * 0.28);
    if (style.link) page.links.push({ x, y: y - descent * size, width, height: (ascent + descent) * size, uri: style.link });
  }

  private drawMarker(page: PdfPage, marker: Marker, baseline: number): void {
    const size = this.size;
    if (marker.label !== null) {
      const font = this.fonts.regular;
      page.ops.push(`BT /${font.resource} ${num(size)} Tf ${rgb(this.text)} rg ${num(marker.right - font.width(marker.label, size))} ${num(baseline)} Td <${font.encode(marker.label)}> Tj ET`);
      return;
    }
    const r = size * 0.17;
    const cx = marker.right - r - 1;
    const cy = baseline + size * 0.33;
    const shape = marker.depth % 3;
    if (shape === 2) {
      page.ops.push(`${rgb(this.text)} rg ${num(cx - r)} ${num(cy - r)} ${num(r * 2)} ${num(r * 2)} re f`);
      return;
    }
    const k = r * 0.5523;
    const circle = `${num(cx + r)} ${num(cy)} m ${num(cx + r)} ${num(cy + k)} ${num(cx + k)} ${num(cy + r)} ${num(cx)} ${num(cy + r)} c ${num(cx - k)} ${num(cy + r)} ${num(cx - r)} ${num(cy + k)} ${num(cx - r)} ${num(cy)} c ${num(cx - r)} ${num(cy - k)} ${num(cx - k)} ${num(cy - r)} ${num(cx)} ${num(cy - r)} c ${num(cx + k)} ${num(cy - r)} ${num(cx + r)} ${num(cy - k)} ${num(cx + r)} ${num(cy)} c`;
    page.ops.push(shape === 0 ? `${rgb(this.text)} rg ${circle} f` : `${rgb(this.text)} RG ${num(size * 0.07)} w ${circle} S`);
  }

  private list(element: HtmlElement, frame: Frame, style: InlineStyle): void {
    const ordered = element.tag === 'ol';
    const items = element.children.filter((child): child is HtmlElement => typeof child !== 'string' && child.tag === 'li');
    const start = Number.parseInt(element.attrs['start'] ?? '', 10);
    const first = Number.isFinite(start) ? start : 1;
    const widest = ordered ? Math.max(...items.map((_, index) => this.fonts.regular.width(`${first + index}.`, this.size))) : 0;
    const indent = Math.max(16, widest + 8);
    this.gap(this.depth ? this.size * 0.25 : this.size * 0.75);
    this.depth++;
    let number = first;
    for (const child of element.children) {
      if (typeof child === 'string') continue;
      if (child.tag === 'li') this.listItem(child, frame, style, indent, ordered ? `${number++}.` : null);
      else this.flow([child], { ...frame, left: frame.left + indent, width: frame.width - indent }, style);
    }
    this.depth--;
    this.gap(this.depth ? this.size * 0.25 : this.size * 0.75);
  }

  private listItem(element: HtmlElement, frame: Frame, style: InlineStyle, indent: number, label: string | null): void {
    const inner = { ...frame, left: frame.left + indent, width: frame.width - indent };
    this.gap(this.size * 0.3);
    this.open(frame);
    this.marker = { label, depth: Math.max(0, this.depth - 1), right: inner.left - 5 };
    this.flow(element.children, inner, style);
    if (this.marker) this.paragraph([{ text: '', style, brk: 'hard' }], inner, false);
    this.gap(this.size * 0.3);
  }

  private code(element: HtmlElement, frame: Frame, style: InlineStyle): void {
    const pad = 8;
    const codeStyle = { ...style, code: true, block: true, color: null };
    const runs = this.runs(element.children, codeStyle);
    const first = runs.find((run) => !run.brk);
    if (first) first.text = first.text.replace(/^\r?\n/, '');
    const last = [...runs].reverse().find((run) => !run.brk);
    if (last) last.text = last.text.replace(/\r?\n$/, '');
    this.gap(this.size * 0.75);
    const fillItem = (): Item => ({
      height: pad * 0.75,
      draw: (page, top) => {
        page.ops.push(`${rgb(this.codeFill)} rg ${num(frame.left)} ${num(top - pad * 0.75)} ${num(frame.width)} ${num(pad * 0.75)} re f`);
        this.drawBars(page, frame.bars, top, pad * 0.75);
      },
    });
    this.emit(fillItem(), frame);
    this.paragraph(runs, { ...frame, align: 'start' }, true, false, this.codeFill, pad);
    this.emit(fillItem(), frame);
    this.gap(this.size * 0.75);
  }

  private rule(frame: Frame): void {
    this.gap(this.size * 0.9);
    this.emit(
      {
        height: 1,
        draw: (page, top) => page.ops.push(`${rgb(this.border)} RG 0.75 w ${num(frame.left)} ${num(top - 0.5)} m ${num(frame.left + frame.width)} ${num(top - 0.5)} l S`),
      },
      frame,
    );
    this.gap(this.size * 0.9);
  }

  private table(element: HtmlElement, frame: Frame, style: InlineStyle): void {
    const rows: { cells: Cell[]; head: boolean }[] = [];
    const captions: HtmlElement[] = [];
    const readRow = (tr: HtmlElement, head: boolean) => {
      const cells = tr.children
        .filter((cell): cell is HtmlElement => typeof cell !== 'string' && (cell.tag === 'td' || cell.tag === 'th'))
        .map((cell) => {
          const header = cell.tag === 'th' || head;
          return {
            header,
            span: Math.max(1, Number.parseInt(cell.attrs['colspan'] ?? '1', 10) || 1),
            align: alignOf(cell, 'start'),
            runs: this.runs(cell.children, header ? { ...style, bold: true } : style),
          };
        });
      if (cells.length) rows.push({ cells, head });
    };
    const walk = (nodes: readonly HtmlNode[], head: boolean) => {
      for (const node of nodes) {
        if (typeof node === 'string') continue;
        if (node.tag === 'tr') readRow(node, head);
        else if (node.tag === 'caption') captions.push(node);
        else if (node.tag === 'thead' || node.tag === 'tbody' || node.tag === 'tfoot') walk(node.children, node.tag === 'thead');
      }
    };
    walk(element.children, false);
    if (!rows.some((row) => row.head) && rows.length > 1 && rows[0].cells.every((cell) => cell.header)) rows[0].head = true;
    const count = Math.max(0, ...rows.map((row) => row.cells.reduce((sum, cell) => sum + cell.span, 0)));
    this.gap(this.size * 0.75);
    for (const caption of captions) this.block(caption, { ...frame, align: 'center' }, style);
    if (!count) {
      this.gap(this.size * 0.75);
      return;
    }
    const padX = 5;
    const padY = 3.5;
    const natural = new Array<number>(count).fill(0);
    const minimum = new Array<number>(count).fill(0);
    for (const row of rows) {
      let column = 0;
      for (const cell of row.cells) {
        if (cell.span === 1 && column < count) {
          const lines = this.layout(cell.runs, Number.POSITIVE_INFINITY, false);
          natural[column] = Math.max(natural[column], ...lines.map((line) => line.width + padX * 2));
          const words = lines.flatMap((line) => line.pieces.filter((piece) => !piece.space).map((piece) => piece.width));
          minimum[column] = Math.max(minimum[column], ...words.map((width) => width + padX * 2));
        }
        column += cell.span;
      }
    }
    const widths = this.columnWidths(natural, minimum, frame.width);
    const xs = widths.reduce<number[]>((acc, width, index) => [...acc, acc[index] + width], [frame.left]);
    const header: Item[] = [];
    const items = rows.map((row) => {
      let column = 0;
      const cells = row.cells.map((cell) => {
        const from = Math.min(column, count - 1);
        column += cell.span;
        const to = Math.min(column, count);
        const x = xs[from];
        const width = xs[to] - x;
        return { x, width, align: cell.align, header: cell.header, lines: this.layout(cell.runs, Math.max(1, width - padX * 2), false) };
      });
      const item = this.rowItem(cells, padX, padY, row.head ? undefined : header);
      if (row.head) header.push(item);
      return item;
    });
    if (header.length) header[header.length - 1].keep = true;
    for (const item of items) this.emit(item, frame);
    this.gap(this.size * 0.75);
  }

  private columnWidths(natural: number[], minimum: number[], available: number): number[] {
    const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
    const wanted = natural.map((value, index) => Math.max(value, minimum[index], 12));
    if (sum(wanted) <= available) {
      const total = sum(wanted);
      return wanted.map((value) => (value * available) / total);
    }
    const floor = minimum.map((value) => Math.max(12, Math.min(value, available / natural.length)));
    const room = available - sum(floor);
    const extra = wanted.map((value, index) => value - floor[index]);
    const extraSum = sum(extra);
    if (room <= 0 || extraSum <= 0) {
      const total = sum(floor);
      return floor.map((value) => (value * available) / total);
    }
    return floor.map((value, index) => value + (extra[index] * room) / extraSum);
  }

  private rowItem(cells: CellLayout[], padX: number, padY: number, header: readonly Item[] | undefined): Item {
    const contentHeight = (lines: Line[]) => lines.reduce((total, line) => total + line.height, 0);
    const height = Math.max(this.size * this.lineFactor, ...cells.map((cell) => contentHeight(cell.lines))) + padY * 2;
    return {
      height,
      header,
      draw: (page, top) => {
        for (const cell of cells) {
          if (cell.header && this.headerFill) page.ops.push(`${rgb(this.headerFill)} rg ${num(cell.x)} ${num(top - height)} ${num(cell.width)} ${num(height)} re f`);
          let y = top - padY;
          for (const line of cell.lines) {
            this.drawLine(page, line, { left: cell.x, width: cell.width, bars: [], align: cell.align }, y, padX);
            y -= line.height;
          }
        }
        for (const cell of cells) page.ops.push(`${rgb(this.border)} RG 0.5 w ${num(cell.x)} ${num(top - height)} ${num(cell.width)} ${num(height)} re S`);
      },
      split: (room) => {
        const fit = room - padY * 2;
        const counts = cells.map((cell) => {
          let used = 0;
          let taken = 0;
          while (taken < cell.lines.length && used + cell.lines[taken].height <= fit) used += cell.lines[taken++].height;
          return taken;
        });
        if (counts.every((taken) => taken === 0) || counts.every((taken, index) => taken === cells[index].lines.length)) return null;
        const part = (from: (cell: CellLayout, index: number) => Line[]) => cells.map((cell, index) => ({ ...cell, lines: from(cell, index) }));
        return [
          this.rowItem(part((cell, index) => cell.lines.slice(0, counts[index])), padX, padY, header),
          this.rowItem(part((cell, index) => cell.lines.slice(counts[index])), padX, padY, header),
        ];
      },
    };
  }
}

function paginate(items: readonly Item[], height: number, top: number, bottom: number): PdfPage[] {
  const pages: PdfPage[] = [];
  let page: PdfPage = { ops: [], links: [] };
  let y = 0;
  let atTop = true;
  const newPage = () => {
    page = { ops: [], links: [] };
    pages.push(page);
    y = height - top;
    atTop = true;
  };
  const place = (item: Item) => {
    item.draw(page, y);
    y -= item.height;
    atTop = false;
  };
  const breakPage = (item: Item) => {
    newPage();
    for (const head of item.header ?? []) place(head);
  };
  newPage();
  for (let index = 0; index < items.length; index++) {
    let item = items[index];
    if (item.pageBreak) {
      if (!atTop) newPage();
      continue;
    }
    if (item.space) {
      if (item.height > y - bottom) newPage();
      else place(item);
      continue;
    }
    let keepRoom = 0;
    if (item.keep) {
      let next = index + 1;
      while (items[next]?.space) keepRoom += items[next++].height;
      keepRoom = items[next] && !items[next].pageBreak ? keepRoom + Math.min(items[next].height, 30) : 0;
    }
    if (!atTop && item.height + keepRoom > y - bottom) {
      const parts = item.split && !keepRoom ? item.split(y - bottom) : null;
      if (parts) {
        place(parts[0]);
        item = parts[1];
      }
      breakPage(item);
    }
    while (item.split && item.height > y - bottom) {
      const parts = item.split(y - bottom);
      if (!parts) break;
      place(parts[0]);
      breakPage(item);
      item = parts[1];
    }
    place(item);
  }
  return pages;
}

/**
 * Writes rich HTML as a paged PDF file blob with real, selectable text: headings, paragraphs, bold, italic, links and
 * inline code, code blocks, nested lists, quotes, rules and tables whose header row repeats on every page. Takes an
 * HTML string, read without a DOM so it also runs on the server, or a DOM node whose content is read; images, forms and
 * scripts are left out. `break-before: page` / `break-after: page` start a new page.
 */
export async function writeHtmlPdf(source: string | Node, options: TxExportHtmlPdfOptions = {}, date = new Date()): Promise<Blob> {
  const font = await (options.font ?? loadDefaultExportFont)();
  const loaded = await loadPdfFonts(font);
  const regular = new PdfFont(loaded.regular, 'F1', 'TXREGU');
  const bold = loaded.bold ? new PdfFont(loaded.bold, 'F2', 'TXBOLD') : regular;
  const italicFont = loadOptionalFont(font.italic);
  const monoFont = loadOptionalFont(font.mono);
  const fonts: Fonts = {
    regular,
    bold,
    italic: italicFont ? new PdfFont(italicFont, 'F3', 'TXITAL') : null,
    mono: monoFont ? new PdfFont(monoFont, 'F4', 'TXMONO') : null,
    fakeBold: bold === regular,
    ascent: loaded.regular.ascent / loaded.regular.unitsPerEm,
    descent: -loaded.regular.descent / loaded.regular.unitsPerEm,
  };
  const page = pageGeometry(options.pageSize, options.orientation === 'landscape' ? 'landscape' : 'portrait', options.margin ?? 48, 0);
  const [top, right, bottom, left] = page.margin;
  const layout = new HtmlPdfLayout(fonts, options);
  const tree = typeof source === 'string' ? parseHtml(source) : readDom(source);
  layout.flow(tree.children, { left, width: page.width - left - right, bars: [], align: 'start' }, PLAIN);
  const pages = paginate(layout.items, page.height, top, bottom);
  if (options.pageNumbers !== false) {
    const muted = hexColor(options.mutedColor, '667085');
    const size = layout.size * 0.85;
    pages.forEach((pdfPage, index) => {
      const label = `${index + 1} / ${pages.length}`;
      pdfPage.ops.push(`BT /${regular.resource} ${num(size)} Tf ${rgb(muted)} rg ${num((page.width - regular.width(label, size)) / 2)} ${num(Math.max(12, bottom / 2 - size / 2))} Td <${regular.encode(label)}> Tj ET`);
    });
  }
  const used = [regular, bold, fonts.italic, fonts.mono].filter((pdfFont, index): pdfFont is PdfFont => !!pdfFont && (index === 0 || pdfFont.used.size > 0));
  return assemblePdf({
    width: page.width,
    height: page.height,
    pages,
    fonts: [...new Set(used)],
    title: options.title,
    author: options.author,
    compress: options.compress,
    date,
  });
}
