export interface LandingNavLink {
  label: string;
  path: string;
}

export interface LandingShot {
  name: string;
  extension: 'png' | 'jpg';
  alt: string;
}

export interface LandingHighlight extends LandingShot {
  eyebrow: string;
  title: string;
  text: string;
  link: string;
  tone: string;
}

export interface LandingTile extends LandingShot {
  eyebrow: string;
  title: string;
  link: string;
  phone?: boolean;
}

export const LANDING_NAV: LandingNavLink[] = [
  { label: 'Docs', path: '/docs' },
  { label: 'Components', path: '/components/button' },
  { label: 'Blocks', path: '/components/app-layout' },
  { label: 'Theming', path: '/theming' },
  { label: 'Icons', path: '/icons' },
];

export const LANDING_HERO: LandingShot = {
  name: 'overview',
  extension: 'png',
  alt: 'A customers page built with tectra: menu, page header, stat tiles, filters and a table',
};

export const LANDING_HIGHLIGHTS: LandingHighlight[] = [
  {
    name: 'board',
    extension: 'png',
    alt: 'A roadmap board with four columns of cards',
    eyebrow: 'Kanban',
    tone: 'var(--tx-primary-base)',
    title: 'Boards that move.',
    text: 'Cards and columns follow the pointer and the keyboard.',
    link: '/components/kanban',
  },
  {
    name: 'editor',
    extension: 'png',
    alt: 'A document in the rich text editor with headings, a list and a quote',
    eyebrow: 'Editor',
    tone: 'var(--tx-purple-500)',
    title: 'Write without leaving the app.',
    text: 'A rich text editor with mentions, images, tables and a slash menu.',
    link: '/components/editor',
  },
  {
    name: 'calendar',
    extension: 'png',
    alt: 'A month calendar with sprints, reviews and a release',
    eyebrow: 'Calendar',
    tone: 'var(--tx-green-500)',
    title: 'Plan the month.',
    text: 'Events that span days, lanes for people and a today mark.',
    link: '/components/month-calendar',
  },
  {
    name: 'palette',
    extension: 'jpg',
    alt: 'A command palette open over the customers page',
    eyebrow: 'Command palette',
    tone: 'var(--tx-amber-500)',
    title: 'Everything is ⌘K away.',
    text: 'Pages, records and actions in one search box.',
    link: '/components/command-palette',
  },
];

export const LANDING_TILES: LandingTile[] = [
  {
    name: 'phone',
    extension: 'png',
    alt: 'The customers page on a phone with stacked tiles and folded filters',
    eyebrow: 'Responsive',
    title: 'Every screen. No extra code.',
    link: '/components/app-layout',
    phone: true,
  },
  {
    name: 'palette',
    extension: 'jpg',
    alt: 'A command palette with pages, customers and actions',
    eyebrow: 'Blocks',
    title: 'Ready blocks, not just buttons.',
    link: '/components/command-palette',
  },
];

export const INSTALL_SNIPPET = [
  { kind: 'keyword', text: 'import' },
  { kind: 'plain', text: ' { provideTectra } ' },
  { kind: 'keyword', text: 'from' },
  { kind: 'string', text: " '@tectra-ng/core/config'" },
  { kind: 'plain', text: ';\n' },
  { kind: 'keyword', text: 'import' },
  { kind: 'plain', text: ' { Tectra } ' },
  { kind: 'keyword', text: 'from' },
  { kind: 'string', text: " '@tectra-ng/themes'" },
  { kind: 'plain', text: ';\n\n' },
  { kind: 'name', text: 'bootstrapApplication' },
  { kind: 'plain', text: '(App, {\n  providers: [' },
  { kind: 'name', text: 'provideTectra' },
  { kind: 'plain', text: '({ preset: Tectra })],\n});' },
];

export const LANDING_WALL: LandingShot[][] = [
  [
    { name: 'board', extension: 'png', alt: '' },
    { name: 'calendar', extension: 'png', alt: '' },
    { name: 'overview', extension: 'png', alt: '' },
  ],
  [
    { name: 'editor', extension: 'png', alt: '' },
    { name: 'palette', extension: 'jpg', alt: '' },
    { name: 'board', extension: 'png', alt: '' },
  ],
  [
    { name: 'calendar', extension: 'png', alt: '' },
    { name: 'overview', extension: 'png', alt: '' },
    { name: 'editor', extension: 'png', alt: '' },
  ],
];
