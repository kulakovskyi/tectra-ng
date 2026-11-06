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
  `export const TX_FLAG_CODES = [\n${codes.map((code) => `  ${JSON.stringify(code)},`).join('\n')}\n] as const;

export type TxFlagCode = (typeof TX_FLAG_CODES)[number];

export type TxFlagModule = () => Promise<{ default: string }>;

export const TX_FLAG_RECTANGLES: Record<TxFlagCode, TxFlagModule> = {
${loaders('rectangle')}
};

export const TX_FLAG_CIRCLES: Record<TxFlagCode, TxFlagModule> = {
${loaders('circle')}
};
`,
);

console.log(`flags: ${codes.length} codes × 2 shapes, ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`);
