/** A parsed TrueType font: metrics, glyph lookup and a subsetter. */
export interface TxTrueTypeFont {
  /** Font units in one em. */
  readonly unitsPerEm: number;
  /** Height above the baseline in font units. */
  readonly ascent: number;
  /** Depth below the baseline in font units, usually negative. */
  readonly descent: number;
  /** Height of capital letters in font units. */
  readonly capHeight: number;
  /** Bounding box of all glyphs as `[xMin, yMin, xMax, yMax]` in font units. */
  readonly bbox: readonly [number, number, number, number];
  /** Number of glyphs in the font. */
  readonly numGlyphs: number;
  /** Name of the font from its name table; `Font` when it has none. */
  readonly name: string;
  /** Gives the glyph for a Unicode code point; 0 when the font has none. */
  glyphId(codePoint: number): number;
  /** Gives the width of a glyph in font units. */
  advance(glyph: number): number;
  /** Builds a smaller font file that keeps only the given glyphs. */
  subset(glyphs: ReadonlySet<number>): Uint8Array;
}

interface TableRecord {
  offset: number;
  length: number;
}

const KEEP_TABLES = ['OS/2', 'cmap', 'cvt ', 'fpgm', 'gasp', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post', 'prep'];

function checksum(bytes: Uint8Array): number {
  const padded = new Uint8Array(Math.ceil(bytes.length / 4) * 4);
  padded.set(bytes);
  const view = new DataView(padded.buffer);
  let sum = 0;
  for (let offset = 0; offset < padded.length; offset += 4) sum = (sum + view.getUint32(offset)) >>> 0;
  return sum;
}

/** Reads a TrueType font file; the result measures glyphs and cuts a smaller font with only the glyphs used. */
export function parseTrueType(input: Uint8Array): TxTrueTypeFont {
  const bytes = input;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const version = view.getUint32(0);
  if (version !== 0x00010000 && version !== 0x74727565) throw new Error('Only TrueType (glyf) fonts can be embedded');
  const tables = new Map<string, TableRecord>();
  const count = view.getUint16(4);
  for (let index = 0; index < count; index++) {
    const at = 12 + index * 16;
    const tag = String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
    tables.set(tag, { offset: view.getUint32(at + 8), length: view.getUint32(at + 12) });
  }
  const table = (tag: string): TableRecord => {
    const record = tables.get(tag);
    if (!record) throw new Error(`Font has no ${tag} table`);
    return record;
  };

  const head = table('head').offset;
  const unitsPerEm = view.getUint16(head + 18);
  const bbox = [view.getInt16(head + 36), view.getInt16(head + 38), view.getInt16(head + 40), view.getInt16(head + 42)] as const;
  const longLoca = view.getInt16(head + 50) === 1;
  const hhea = table('hhea').offset;
  const ascent = view.getInt16(hhea + 4);
  const descent = view.getInt16(hhea + 6);
  const metrics = view.getUint16(hhea + 34);
  const numGlyphs = view.getUint16(table('maxp').offset + 4);
  const os2 = tables.get('OS/2');
  const capHeight = os2 && view.getUint16(os2.offset) >= 2 ? view.getInt16(os2.offset + 88) : Math.round(ascent * 0.7);
  const hmtx = table('hmtx').offset;

  const cmap = new Map<number, number>();
  const cmapAt = table('cmap').offset;
  const subtables: { platform: number; encoding: number; offset: number }[] = [];
  for (let index = 0; index < view.getUint16(cmapAt + 2); index++) {
    const at = cmapAt + 4 + index * 8;
    subtables.push({ platform: view.getUint16(at), encoding: view.getUint16(at + 2), offset: cmapAt + view.getUint32(at + 4) });
  }
  const rank = (entry: { platform: number; encoding: number; offset: number }) => {
    const format = view.getUint16(entry.offset);
    if (entry.platform === 3 && entry.encoding === 10 && format === 12) return 0;
    if (entry.platform === 0 && format === 12) return 1;
    if (entry.platform === 3 && entry.encoding === 1 && format === 4) return 2;
    if (entry.platform === 0 && format === 4) return 3;
    return 9;
  };
  const best = subtables.sort((a, b) => rank(a) - rank(b))[0];
  if (best && rank(best) < 9) {
    const at = best.offset;
    if (view.getUint16(at) === 12) {
      const groups = view.getUint32(at + 12);
      for (let index = 0; index < groups; index++) {
        const group = at + 16 + index * 12;
        const start = view.getUint32(group);
        const end = view.getUint32(group + 4);
        const glyph = view.getUint32(group + 8);
        for (let code = start; code <= end && code - start < 0x10000; code++) cmap.set(code, glyph + code - start);
      }
    } else {
      const segments = view.getUint16(at + 6) / 2;
      const ends = at + 14;
      const starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2;
      const ranges = deltas + segments * 2;
      for (let segment = 0; segment < segments; segment++) {
        const start = view.getUint16(starts + segment * 2);
        const end = view.getUint16(ends + segment * 2);
        const delta = view.getInt16(deltas + segment * 2);
        const rangeAt = ranges + segment * 2;
        const range = view.getUint16(rangeAt);
        for (let code = start; code <= end && code !== 0xffff; code++) {
          let glyph = 0;
          if (range === 0) glyph = (code + delta) & 0xffff;
          else {
            const raw = view.getUint16(rangeAt + range + (code - start) * 2);
            glyph = raw ? (raw + delta) & 0xffff : 0;
          }
          if (glyph) cmap.set(code, glyph);
        }
      }
    }
  }

  const loca = table('loca').offset;
  const glyf = table('glyf').offset;
  const glyphRange = (glyph: number): [number, number] =>
    longLoca ? [view.getUint32(loca + glyph * 4), view.getUint32(loca + glyph * 4 + 4)] : [view.getUint16(loca + glyph * 2) * 2, view.getUint16(loca + glyph * 2 + 2) * 2];

  const name = readName(view, tables.get('name')) ?? 'Font';

  return {
    unitsPerEm,
    ascent,
    descent,
    capHeight,
    bbox,
    numGlyphs,
    name,
    glyphId: (codePoint) => cmap.get(codePoint) ?? 0,
    advance: (glyph) => view.getUint16(hmtx + Math.min(glyph, metrics - 1) * 4),
    subset(glyphs) {
      const keep = new Set<number>([0, ...glyphs]);
      const queue = [...keep];
      while (queue.length) {
        const glyph = queue.pop() as number;
        if (glyph >= numGlyphs) continue;
        const [start, end] = glyphRange(glyph);
        if (end - start < 10 || view.getInt16(glyf + start) >= 0) continue;
        let at = glyf + start + 10;
        for (;;) {
          const flags = view.getUint16(at);
          const component = view.getUint16(at + 2);
          if (!keep.has(component)) {
            keep.add(component);
            queue.push(component);
          }
          at += 4 + (flags & 1 ? 4 : 2) + (flags & 8 ? 2 : flags & 0x40 ? 4 : flags & 0x80 ? 8 : 0);
          if (!(flags & 0x20)) break;
        }
      }
      const parts: Uint8Array[] = [];
      const offsets = new DataView(new ArrayBuffer((numGlyphs + 1) * 4));
      let size = 0;
      for (let glyph = 0; glyph < numGlyphs; glyph++) {
        offsets.setUint32(glyph * 4, size);
        if (!keep.has(glyph)) continue;
        const [start, end] = glyphRange(glyph);
        const length = end - start;
        if (length <= 0) continue;
        const padded = new Uint8Array(Math.ceil(length / 4) * 4);
        padded.set(bytes.subarray(glyf + start, glyf + end));
        parts.push(padded);
        size += padded.length;
      }
      offsets.setUint32(numGlyphs * 4, size);
      const newGlyf = new Uint8Array(size);
      let offset = 0;
      for (const part of parts) {
        newGlyf.set(part, offset);
        offset += part.length;
      }
      const newHead = bytes.slice(head, head + table('head').length);
      new DataView(newHead.buffer).setUint32(8, 0);
      new DataView(newHead.buffer).setInt16(50, 1);
      const post = tables.get('post');
      const newPost = post ? bytes.slice(post.offset, post.offset + 32) : null;
      if (newPost) new DataView(newPost.buffer).setUint32(0, 0x00030000);
      const out = new Map<string, Uint8Array>();
      for (const tag of KEEP_TABLES) {
        const record = tables.get(tag);
        if (!record) continue;
        if (tag === 'glyf') out.set(tag, newGlyf);
        else if (tag === 'loca') out.set(tag, new Uint8Array(offsets.buffer));
        else if (tag === 'head') out.set(tag, newHead);
        else if (tag === 'post' && newPost) out.set(tag, newPost);
        else out.set(tag, bytes.slice(record.offset, record.offset + record.length));
      }
      return writeFont(out);
    },
  };
}

function readName(view: DataView, record: TableRecord | undefined): string | null {
  if (!record) return null;
  const count = view.getUint16(record.offset + 2);
  const storage = record.offset + view.getUint16(record.offset + 4);
  let fallback: string | null = null;
  for (let index = 0; index < count; index++) {
    const at = record.offset + 6 + index * 12;
    const platform = view.getUint16(at);
    const id = view.getUint16(at + 6);
    if (id !== 6) continue;
    const length = view.getUint16(at + 8);
    const offset = storage + view.getUint16(at + 10);
    let text = '';
    if (platform === 3 || platform === 0) for (let i = 0; i < length; i += 2) text += String.fromCharCode(view.getUint16(offset + i));
    else for (let i = 0; i < length; i++) text += String.fromCharCode(view.getUint8(offset + i));
    const clean = text.replace(/[^A-Za-z0-9-]/g, '');
    if (clean) {
      if (platform === 3) return clean;
      fallback = clean;
    }
  }
  return fallback;
}

function writeFont(tables: Map<string, Uint8Array>): Uint8Array {
  const tags = [...tables.keys()].sort();
  const count = tags.length;
  let power = 1;
  while (power * 2 <= count) power *= 2;
  let offset = 12 + count * 16;
  const layout = tags.map((tag) => {
    const data = tables.get(tag) as Uint8Array;
    const entry = { tag, data, offset };
    offset += Math.ceil(data.length / 4) * 4;
    return entry;
  });
  const out = new Uint8Array(offset);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x00010000);
  view.setUint16(4, count);
  view.setUint16(6, power * 16);
  view.setUint16(8, Math.log2(power));
  view.setUint16(10, count * 16 - power * 16);
  layout.forEach((entry, index) => {
    const at = 12 + index * 16;
    for (let i = 0; i < 4; i++) out[at + i] = entry.tag.charCodeAt(i);
    view.setUint32(at + 4, checksum(entry.data));
    view.setUint32(at + 8, entry.offset);
    view.setUint32(at + 12, entry.data.length);
    out.set(entry.data, entry.offset);
  });
  const head = layout.find((entry) => entry.tag === 'head');
  if (head) view.setUint32(head.offset + 8, (0xb1b0afba - checksum(out)) >>> 0);
  return out;
}
