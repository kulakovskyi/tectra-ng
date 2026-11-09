import { DOC_COMPONENTS } from '../../generated/registry';
import { DocPageMeta } from '../types/seo.interface';

export const SITE_URL = 'https://tectra-ng.com';
export const SITE_NAME = 'tectra';
export const SITE_IMAGE = { path: '/images/social-preview.png', width: 1200, height: 630 };
export const REPOSITORY_URL = 'https://github.com/kulakovskyi/tectra-ng';
export const DESCRIPTION_LENGTH = 160;

export const PAGE_META: Record<string, DocPageMeta> = {
  '/': {
    name: 'tectra',
    title: 'tectra — Angular UI kit that feels finished',
    description: `Angular UI kit on signals: ${DOC_COMPONENTS.length} components and ready page blocks, design tokens, light and dark themes, icons, a rich text editor and QR codes — open source.`,
  },
  '/docs': {
    name: 'Introduction',
    title: 'tectra — Angular UI component library on signals',
    description: `Open-source Angular UI kit: ${DOC_COMPONENTS.length} standalone components on signals — table, datepicker, select, dialog, editor — with design tokens, dark mode and icons.`,
  },
  '/getting-started': {
    name: 'Installation',
    title: 'Installation — tectra Angular UI kit',
    description: 'Add tectra to an Angular app: install the npm package, call provideTectra, pick a theme and import standalone components one by one.',
  },
  '/theming': {
    name: 'Theming',
    title: 'Theming and design tokens — tectra Angular UI kit',
    description: 'Theme Angular components with design tokens as CSS variables: light and dark mode, primary and surface colours, theme styles, presets and per-component dt.',
  },
  '/icons': {
    name: 'Icons',
    title: 'Angular icon set — tectra',
    description: 'Search and copy SVG icons for Angular with the TxIcon component, plus brand logos and country flags loaded on demand.',
  },
  '/core/overlay': {
    name: 'Overlay',
    title: 'Angular overlay: popups, menus and panels — tectra',
    description: 'TxOverlay opens a template or component next to any element: 12 placements with flip, enter and leave motion, scroll strategies, focus return and sticky header insets.',
  },
  '/core/locale': {
    name: 'Locale',
    title: 'Locale and i18n for Angular components — tectra',
    description: 'Translate tectra components and format numbers and dates with TxLocaleService: built-in locales, runtime switching and Intl formatting.',
  },
};

export const componentMeta = (title: string, summary: string): DocPageMeta => ({
  name: title,
  title: `Angular ${title} component — tectra UI kit`,
  description: summary,
});
