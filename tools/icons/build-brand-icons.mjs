import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as simpleIcons from 'simple-icons';

const root = join(new URL('.', import.meta.url).pathname, '../..');
const BRANDS = {
  android: 'android',
  apple: 'apple',
  discord: 'discord',
  ethereum: 'ethereum',
  facebook: 'facebook',
  github: 'github',
  google: 'google',
  instagram: 'instagram',
  paypal: 'paypal',
  pinterest: 'pinterest',
  reddit: 'reddit',
  telegram: 'telegram',
  tiktok: 'tiktok',
  twitch: 'twitch',
  twitter: 'x',
  x: 'x',
  vimeo: 'vimeo',
  whatsapp: 'whatsapp',
  youtube: 'youtube',
};

const bySlug = Object.fromEntries(Object.values(simpleIcons).filter((icon) => icon?.slug).map((icon) => [icon.slug, icon]));
const entries = Object.entries(BRANDS).map(([name, slug]) => {
  const icon = bySlug[slug];
  if (!icon) {
    throw new Error(`simple-icons has no "${slug}"`);
  }
  return { name, icon };
});

const transform = 'translate(2.4 2.4) scale(0.8)';
const names = entries.map(({ name }) => `  | '${name}'`).join('\n');
const icons = entries
  .map(({ name, icon }) => `  ${JSON.stringify(name)}: [{ d: ${JSON.stringify(icon.path)}, fill: true, stroke: false, transform: '${transform}' }],`)
  .join('\n');
const colors = entries.map(({ name, icon }) => `  ${JSON.stringify(name)}: '#${icon.hex}',`).join('\n');
const titles = entries.map(({ name, icon }) => `  ${JSON.stringify(name)}: ${JSON.stringify(icon.title)},`).join('\n');

writeFileSync(
  join(root, 'packages/brand-icons/src/brand-icons.ts'),
  `import { TxIconPath } from '@tectra/icons';

export type TxBrandIconName =
${names};

export const TX_BRAND_ICONS: Record<TxBrandIconName, TxIconPath[]> = {
${icons}
};

export const TX_BRAND_COLORS: Record<TxBrandIconName, string> = {
${colors}
};

export const TX_BRAND_TITLES: Record<TxBrandIconName, string> = {
${titles}
};
`,
);
console.log(`brand icons: ${entries.length}`);
