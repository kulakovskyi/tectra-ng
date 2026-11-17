import { TxExportFont } from '../export.types';
import { base64ToBytes, compress, concatBytes, utf8 } from './bytes';
import { TxTrueTypeFont, parseTrueType } from './truetype';

export class PdfFont {
  readonly used = new Map<number, number>();

  constructor(
    readonly ttf: TxTrueTypeFont,
    readonly resource: string,
    readonly tag: string,
  ) {}

  width(text: string, size: number): number {
    let units = 0;
    for (const char of text) units += this.ttf.advance(this.ttf.glyphId(char.codePointAt(0) as number));
    return (units * size) / this.ttf.unitsPerEm;
  }

  encode(text: string): string {
    let hex = '';
    for (const char of text) {
      const code = char.codePointAt(0) as number;
      const glyph = this.ttf.glyphId(code);
      if (!this.used.has(glyph)) this.used.set(glyph, code);
      hex += glyph.toString(16).padStart(4, '0');
    }
    return hex;
  }
}

export interface PdfLink {
  x: number;
  y: number;
  width: number;
  height: number;
  uri: string;
}

export interface PdfPage {
  ops: string[];
  links: PdfLink[];
}

export interface PdfAssembly {
  width: number;
  height: number;
  pages: readonly PdfPage[];
  fonts: readonly PdfFont[];
  title?: string;
  author?: string;
  compress?: boolean;
  date: Date;
}

function toBytes(source: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof source === 'string') return base64ToBytes(source);
  return source instanceof Uint8Array ? source : new Uint8Array(source);
}

export function rgb(hex: string): string {
  const value = parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((part) => +(part / 255).toFixed(3)).join(' ');
}

export function num(value: number): string {
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

function asciiString(text: string): string {
  return `(${encodeURI(decodeUriSafe(text)).replace(/[\\()]/g, (char) => `\\${char}`)})`;
}

function decodeUriSafe(text: string): string {
  try {
    return decodeURI(text);
  } catch {
    return text;
  }
}

function pdfDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function loadPdfFonts(font: TxExportFont): Promise<{ regular: TxTrueTypeFont; bold: TxTrueTypeFont | null }> {
  return { regular: parseTrueType(toBytes(font.regular)), bold: font.bold ? parseTrueType(toBytes(font.bold)) : null };
}

export function loadOptionalFont(source: ArrayBuffer | Uint8Array | string | undefined): TxTrueTypeFont | null {
  return source ? parseTrueType(toBytes(source)) : null;
}

export async function assemblePdf(document: PdfAssembly): Promise<Blob> {
  const objects: (Uint8Array | null)[] = [];
  const reserve = () => {
    objects.push(null);
    return objects.length;
  };
  const set = (id: number, body: string | Uint8Array) => {
    objects[id - 1] = typeof body === 'string' ? utf8(`${id} 0 obj\n${body}\nendobj\n`) : body;
  };
  const stream = async (id: number, dict: string, data: Uint8Array) => {
    const packed = document.compress === false ? null : await compress(data, 'deflate');
    const body = packed ?? data;
    set(id, concatBytes([utf8(`${id} 0 obj\n<< ${dict} /Length ${body.length}${packed ? ' /Filter /FlateDecode' : ''} >>\nstream\n`), body, utf8('\nendstream\nendobj\n')]));
  };

  const catalog = reserve();
  const pagesId = reserve();
  const info = reserve();
  const fontIds = new Map<PdfFont, number>();
  for (const pdfFont of document.fonts) fontIds.set(pdfFont, reserve());
  const pageIds = document.pages.map((page) => ({ page: reserve(), content: reserve(), links: page.links.map(() => reserve()) }));
  const fontsDict = [...fontIds].map(([pdfFont, id]) => `/${pdfFont.resource} ${id} 0 R`).join(' ');

  for (const [index, ids] of pageIds.entries()) {
    const page = document.pages[index];
    const annots = ids.links.length ? ` /Annots [${ids.links.map((id) => `${id} 0 R`).join(' ')}]` : '';
    set(ids.page, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(document.width)} ${num(document.height)}] /Resources << /Font << ${fontsDict} >> >> /Contents ${ids.content} 0 R${annots} >>`);
    await stream(ids.content, '', utf8(page.ops.join('\n')));
    page.links.forEach((link, linkIndex) => {
      const rect = [link.x, link.y, link.x + link.width, link.y + link.height].map(num).join(' ');
      set(ids.links[linkIndex], `<< /Type /Annot /Subtype /Link /Rect [${rect}] /Border [0 0 0] /A << /Type /Action /S /URI /URI ${asciiString(link.uri)} >> >>`);
    });
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
    const entries = glyphs.map((glyph) => `<${glyph.toString(16).padStart(4, '0')}> <${utf16Hex(String.fromCodePoint(pdfFont.used.get(glyph) as number))}>`);
    const chunks: string[] = [];
    for (let index = 0; index < entries.length; index += 100) {
      const chunk = entries.slice(index, index + 100);
      chunks.push(`${chunk.length} beginbfchar\n${chunk.join('\n')}\nendbfchar`);
    }
    const cmap = `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${chunks.join('\n')}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    await stream(toUnicode, '', utf8(cmap));
  }

  set(catalog, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  set(pagesId, `<< /Type /Pages /Kids [${pageIds.map((ids) => `${ids.page} 0 R`).join(' ')}] /Count ${pageIds.length} >>`);
  const infoParts = [`/Producer (tectra)`, `/CreationDate (${pdfDate(document.date)})`];
  if (document.title) infoParts.push(`/Title ${pdfString(document.title)}`);
  if (document.author) infoParts.push(`/Author ${pdfString(document.author)}`);
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
