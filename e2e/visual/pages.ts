import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = join(__dirname, '../../apps/docs/src/content/components');

export const COMPONENT_PAGES = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => `/components/${entry.name}`);

export const PAGES = ['/', '/docs', '/getting-started', '/theming', '/icons', '/core/overlay', '/core/locale', ...COMPONENT_PAGES];
