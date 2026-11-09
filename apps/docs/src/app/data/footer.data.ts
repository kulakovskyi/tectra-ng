import { TxAppFooterLink } from '@tectra-ng/blocks/app-footer';
import { REPOSITORY_URL } from './seo.data';

export interface FooterColumn {
  title: string;
  links: { label: string; path?: string; url?: string }[];
}

export const FOOTER_LINKS: TxAppFooterLink[] = [
  { label: 'Docs', routerLink: '/docs' },
  { label: 'Installation', routerLink: '/getting-started' },
  { label: 'GitHub', url: REPOSITORY_URL, target: '_blank' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Kit',
    links: [
      { label: 'Components', path: '/components/button' },
      { label: 'Blocks', path: '/components/app-layout' },
      { label: 'Editor', path: '/components/editor' },
      { label: 'QR code', path: '/components/qr-code' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', path: '/docs' },
      { label: 'Installation', path: '/getting-started' },
      { label: 'Theming', path: '/theming' },
      { label: 'Icons', path: '/icons' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', url: REPOSITORY_URL },
      { label: 'Changelog', url: `${REPOSITORY_URL}/blob/main/CHANGELOG.md` },
      { label: 'npm', url: 'https://www.npmjs.com/package/tectra-ng' },
    ],
  },
];
