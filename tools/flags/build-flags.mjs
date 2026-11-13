import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { optimize } from 'svgo';

const root = join(new URL('.', import.meta.url).pathname, '../..');
const source = join(dirname(createRequire(import.meta.url).resolve('flag-icons/package.json')), 'flags');
const outDir = join(root, 'packages/flags/src/generated');
const SETS = { rectangle: '4x3', circle: '1x1' };

const svgoConfig = {
  multipass: true,
  plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: { minify: true } } } }],
};

rmSync(outDir, { recursive: true, force: true });
const codes = readdirSync(join(source, SETS.rectangle))
  .filter((file) => file.endsWith('.svg'))
  .map((file) => file.slice(0, -4))
  .sort();

let before = 0;
let after = 0;
for (const [shape, folder] of Object.entries(SETS)) {
  mkdirSync(join(outDir, shape), { recursive: true });
  for (const code of codes) {
    const raw = readFileSync(join(source, folder, `${code}.svg`), 'utf8');
    const { data } = optimize(raw, svgoConfig);
    before += raw.length;
    after += data.length;
    writeFileSync(join(outDir, shape, `${code}.ts`), `const flag = ${JSON.stringify(data)};\n\nexport default flag;\n`);
  }
}

const loaders = (shape) => codes.map((code) => `  ${JSON.stringify(code)}: () => import('./${shape}/${code}'),`).join('\n');
writeFileSync(
  join(outDir, 'flag-loaders.ts'),
  `/** Codes of every flag in the set, lower case: ISO 3166-1 alpha-2 country codes, regions such as \`gb-sct\` and groups such as \`eu\`. */
export const TX_FLAG_CODES = [\n${codes.map((code) => `  ${JSON.stringify(code)},`).join('\n')}\n] as const;

/** Code of a country flag in the set, e.g. \`'ua'\`. */
export type TxFlagCode = (typeof TX_FLAG_CODES)[number];

/** Loads the SVG of one flag as its own lazy chunk. */
export type TxFlagModule = () => Promise<{ default: string }>;

/** Loaders of the rectangle flags by code. */
export const TX_FLAG_RECTANGLES: Record<TxFlagCode, TxFlagModule> = {
${loaders('rectangle')}
};

/** Loaders of the round flags by code. */
export const TX_FLAG_CIRCLES: Record<TxFlagCode, TxFlagModule> = {
${loaders('circle')}
};
`,
);

console.log(`flags: ${codes.length} codes × 2 shapes, ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`);
