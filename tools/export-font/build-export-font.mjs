import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KEEP = ['OS/2', 'cmap', 'cvt ', 'fpgm', 'gasp', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post', 'prep'];
const root = new URL('../../', import.meta.url).pathname;
const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run export-font -- <folder of the Onest release with fonts/ttf and OFL.txt>');
  process.exit(1);
}

function checksum(bytes) {
  const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
  bytes.copy(padded);
  let sum = 0;
  for (let offset = 0; offset < padded.length; offset += 4) sum = (sum + padded.readUInt32BE(offset)) >>> 0;
  return sum;
}

function strip(file) {
  const font = readFileSync(file);
  const count = font.readUInt16BE(4);
  const tables = new Map();
  for (let index = 0; index < count; index++) {
    const at = 12 + index * 16;
    const tag = font.toString('latin1', at, at + 4);
    if (!KEEP.includes(tag)) continue;
    const offset = font.readUInt32BE(at + 8);
    const length = font.readUInt32BE(at + 12);
    let data = Buffer.from(font.subarray(offset, offset + length));
    if (tag === 'post') {
      data = Buffer.from(data.subarray(0, 32));
      data.writeUInt32BE(0x00030000, 0);
    }
    if (tag === 'head') data.writeUInt32BE(0, 8);
    tables.set(tag, data);
  }
  const tags = [...tables.keys()].sort();
  let power = 1;
  while (power * 2 <= tags.length) power *= 2;
  let offset = 12 + tags.length * 16;
  const layout = tags.map((tag) => {
    const entry = { tag, data: tables.get(tag), offset };
    offset += Math.ceil(entry.data.length / 4) * 4;
    return entry;
  });
  const out = Buffer.alloc(offset);
  out.writeUInt32BE(0x00010000, 0);
  out.writeUInt16BE(tags.length, 4);
  out.writeUInt16BE(power * 16, 6);
  out.writeUInt16BE(Math.log2(power), 8);
  out.writeUInt16BE(tags.length * 16 - power * 16, 10);
  layout.forEach((entry, index) => {
    const at = 12 + index * 16;
    out.write(entry.tag, at, 'latin1');
    out.writeUInt32BE(checksum(entry.data), at + 4);
    out.writeUInt32BE(entry.offset, at + 8);
    out.writeUInt32BE(entry.data.length, at + 12);
    entry.data.copy(out, entry.offset);
  });
  const head = layout.find((entry) => entry.tag === 'head');
  out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, head.offset + 8);
  return out;
}

const regular = strip(join(source, 'fonts/ttf/Onest-Regular.ttf'));
const bold = strip(join(source, 'fonts/ttf/Onest-SemiBold.ttf'));
const target = join(root, 'packages/ui/export-font/src/generated/onest.font.ts');
writeFileSync(
  target,
  `export const TX_EXPORT_FONT_REGULAR = '${regular.toString('base64')}';\n\nexport const TX_EXPORT_FONT_BOLD = '${bold.toString('base64')}';\n`,
);
copyFileSync(join(source, 'OFL.txt'), join(root, 'packages/ui/export-font/OFL.txt'));
console.log(`export font: regular ${regular.length} B, semibold ${bold.length} B → ${target}`);
