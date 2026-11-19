import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = join(__dirname, '../../apps/docs/src/content/components');

export const COMPONENT_PAGES = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `/components/${entry.name}`);

export const CATEGORY_PAGES = [
  ...new Set(
    COMPONENT_PAGES.map((path) => {
      const overview = readFileSync(join(contentDir, path.replace('/components/', ''), 'overview.md'), 'utf8');
      return `/categories/${(overview.match(/^category:\s*(.+)$/m)?.[1] ?? 'Other').trim().toLowerCase().replace(/\s+/g, '-')}`;
    }),
  ),
];

export const PAGES = ['/', '/docs', '/getting-started', '/theming', '/icons', '/core/overlay', '/core/locale', '/components', ...CATEGORY_PAGES, ...COMPONENT_PAGES];
