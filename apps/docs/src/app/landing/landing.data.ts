import { LandingCatalogRow, LandingCodePart, LandingFeature, LandingLibrary, LandingNavLink, LandingOrbitItem, LandingTally, LandingTile, LandingWord } from './landing.types';

export const LANDING_NAV: LandingNavLink[] = [
  { label: 'Docs', path: '/docs' },
  { label: 'Components', path: '/components/button' },
  { label: 'Blocks', path: '/components/app-layout' },
  { label: 'Theming', path: '/theming' },
  { label: 'Icons', path: '/icons' },
];

export const HERO_WORDS: LandingWord[] = [
  { text: 'tables', tone: 'sky' },
  { text: 'forms', tone: 'green' },
  { text: 'charts', tone: 'amber' },
  { text: 'editors', tone: 'orange' },
  { text: 'boards', tone: 'purple' },
  { text: 'dialogs', tone: 'blue' },
  { text: 'wizards', tone: 'green' },
];

export const HERO_TILES: LandingTile[] = [
  { col: 1, row: 1, kind: 'square', tone: 'green', small: true },
  { col: 2, row: 1, kind: 'triangle', tone: 'orange', small: true },
  { col: 4, row: 1, kind: 'quarter', tone: 'amber' },
  { col: 5, row: 1, kind: 'square', tone: 'sky', icon: 'table' },
  { col: 6, row: 1, kind: 'arch', tone: 'purple' },
  { col: 7, row: 1, kind: 'square', tone: 'green', icon: 'chart-line' },
  { col: 8, row: 1, kind: 'diamond', tone: 'orange' },
  { col: 9, row: 1, kind: 'square', tone: 'amber', small: true },
  { col: 1, row: 2, kind: 'circle', tone: 'sky', small: true },
  { col: 2, row: 2, kind: 'square', tone: 'amber', icon: 'calendar' },
  { col: 3, row: 2, kind: 'triangle', tone: 'orange', turn: 90 },
  { col: 4, row: 2, kind: 'circle', tone: 'green' },
  { col: 5, row: 2, kind: 'square', tone: 'blue', icon: 'pencil' },
  { col: 7, row: 2, kind: 'square', tone: 'sky' },
  { col: 8, row: 2, kind: 'drop', tone: 'purple', icon: 'bell' },
  { col: 9, row: 2, kind: 'leaf', tone: 'green' },
  { col: 10, row: 2, kind: 'square', tone: 'orange', icon: 'search' },
  { col: 11, row: 2, kind: 'square', tone: 'amber', small: true },
  { col: 3, row: 3, kind: 'square', tone: 'purple', small: true },
  { col: 4, row: 3, kind: 'square', tone: 'orange' },
  { col: 5, row: 3, kind: 'bowl', tone: 'green' },
  { col: 6, row: 3, kind: 'bowl', tone: 'sky' },
  { col: 7, row: 3, kind: 'square', tone: 'amber', icon: 'objects-column' },
  { col: 8, row: 3, kind: 'quarter', tone: 'blue', turn: 90 },
  { col: 10, row: 3, kind: 'circle', tone: 'purple', small: true },
  { col: 11, row: 1, kind: 'ring', tone: 'orange', small: true },
];

export const INTRO_STATEMENT =
  'tectra is an Angular UI kit for consoles and admin apps. Components, charts, editors and whole page blocks, built on signals and themed with one set of tokens.';

export const INTRO_ORBIT: LandingOrbitItem[] = [
  { kind: 'diamond', tone: 'amber', icon: 'send' },
  { kind: 'circle', tone: 'green', icon: 'comment' },
  { kind: 'square', tone: 'purple', icon: 'hourglass' },
  { kind: 'square', tone: 'sky', icon: 'chart-pie' },
  { kind: 'diamond', tone: 'orange', icon: 'calendar' },
  { kind: 'circle', tone: 'green', icon: 'filter' },
  { kind: 'circle', tone: 'blue', icon: 'file' },
  { kind: 'square', tone: 'sky', icon: 'table' },
];

export const QUESTIONS: string[] = [
  'Which date picker this time?',
  'Does it work with signals?',
  'Dark mode. Again.',
  'Will it render on the server?',
  'Who themes the charts?',
  'Can the table do 10k rows?',
  'Why is the bundle so big?',
  'Where do the icons come from?',
  'Does the dialog trap focus?',
  'Three libraries, three looks',
  'Mentions in the editor?',
  'axe found 40 issues',
];

export const FEATURES: LandingFeature[] = [
  {
    label: 'Data',
    title: 'Tables that do the heavy lifting',
    text: 'Sort, filter, edit and export rows without writing the grid yourself.',
    points: ['Sorting, filters and pagination', 'Cell and row editing', 'Frozen columns and virtual scroll', 'Cards on narrow screens'],
    link: '/components/table',
    linkLabel: 'Explore the table',
    tone: 'sky',
    demo: 'table',
  },
  {
    label: 'Forms',
    title: 'Forms that feel finished',
    text: 'Every control works with reactive forms, ngModel and signal forms, with labels, hints and errors wired up.',
    points: ['35 form controls', 'Validation messages in place', 'Keyboard and screen reader ready', 'Fluid and compact sizes'],
    link: '/components/field',
    linkLabel: 'See the form controls',
    tone: 'green',
    demo: 'form',
  },
  {
    label: 'Charts',
    title: 'Charts without a chart library',
    text: 'SVG charts drawn by the kit, rendered on the server and coloured by the same tokens as the rest of the app.',
    points: ['Line, column, pie and 20 more', 'Tooltips, legends and brushing', 'Accessible data tables', 'PNG and SVG download'],
    link: '/components/line-chart',
    linkLabel: 'Browse the charts',
    tone: 'amber',
    demo: 'chart',
  },
  {
    label: 'Editors',
    title: 'Write without leaving the app',
    text: 'A rich text editor with mentions, tables and a slash menu, and a code editor with diff views.',
    points: ['Mentions and slash commands', 'Images and tables', 'Syntax colours from tokens', 'Inline and side by side diffs'],
    link: '/components/editor',
    linkLabel: 'Open the editor',
    tone: 'purple',
    demo: 'editor',
  },
  {
    label: 'Theming',
    title: 'Make it yours in one line',
    text: 'Pick a style, a primary colour and a surface. Try it here: the whole page follows.',
    points: ['Four styles, seventeen colours', 'Light and dark from the same tokens', 'Design tokens per component', 'Unstyled mode and pass-through'],
    link: '/theming',
    linkLabel: 'Read about theming',
    tone: 'orange',
    demo: 'theme',
  },
  {
    label: 'Blocks',
    title: 'Whole screens, not just buttons',
    text: 'App shells, command palettes, kanban boards and wizards, ready to drop into a route.',
    points: ['App and console layouts', 'Kanban and command palette', 'Wizards and filter panels', 'Empty states and cookie notice'],
    link: '/components/kanban',
    linkLabel: 'See the blocks',
    tone: 'blue',
    demo: 'board',
  },
];

export const LIBRARIES: LandingLibrary[] = [
  {
    title: 'A data grid',
    text: 'Sorting, filters, editing',
    icon: 'table',
    tone: 'sky',
    x: -1,
    y: -1,
    turn: -6,
  },
  {
    title: 'A date picker',
    text: 'Ranges, time, locales',
    icon: 'calendar',
    tone: 'green',
    x: -0.34,
    y: -1.15,
    turn: 4,
  },
  {
    title: 'A chart library',
    text: 'Line, pie, sankey',
    icon: 'chart-bar',
    tone: 'amber',
    x: 0.34,
    y: -1.05,
    turn: -3,
  },
  {
    title: 'A rich text editor',
    text: 'Mentions, tables, images',
    icon: 'pen-to-square',
    tone: 'purple',
    x: 1,
    y: -0.95,
    turn: 7,
  },
  {
    title: 'A code editor',
    text: 'Syntax, search, diff',
    icon: 'code',
    tone: 'orange',
    x: -0.95,
    y: 0.95,
    turn: 5,
  },
  {
    title: 'An icon set',
    text: 'One style, many sizes',
    icon: 'star',
    tone: 'blue',
    x: -0.3,
    y: 1.1,
    turn: -5,
  },
  {
    title: 'Country flags',
    text: 'Every country, lazy',
    icon: 'flag',
    tone: 'green',
    x: 0.36,
    y: 1,
    turn: 3,
  },
  {
    title: 'A QR encoder',
    text: 'Styled SVG and PNG',
    icon: 'qrcode',
    tone: 'sky',
    x: 1,
    y: 1.05,
    turn: -7,
  },
];

export const TALLIES: LandingTally[] = [
  { before: '8+', beforeLabel: 'libraries to pick', after: '1', afterLabel: 'install' },
  { before: '8', beforeLabel: 'looks to align', after: '1', afterLabel: 'theme' },
  { before: '8', beforeLabel: 'changelogs to follow', after: '1', afterLabel: 'version' },
];

export const GLUE_ORBIT: string[] = ['Table', 'Select', 'Datepicker', 'Dialog', 'Charts', 'Editor', 'Kanban', 'Icons', 'Flags', 'Tokens'];

export const CATALOG: LandingCatalogRow[] = [
  {
    label: 'Input',
    title: 'Collect anything',
    tiles: [
      {
        title: 'Forms',
        note: 'Inputs, selects, pickers',
        categories: ['Form'],
        link: '/components/input',
        tone: 'sky',
        glyph: 'dots',
      },
      {
        title: 'Actions',
        note: 'Buttons, menus, speed dial',
        categories: ['Actions'],
        link: '/components/button',
        tone: 'blue',
        glyph: 'asterisk',
      },
      {
        title: 'Code',
        note: 'Editor, diff, highlight',
        categories: ['Code'],
        link: '/components/code-editor',
        tone: 'orange',
        glyph: 'arch',
      },
    ],
  },
  {
    label: 'Show',
    title: 'Make data readable',
    tiles: [
      {
        title: 'Data and display',
        note: 'Tables, trees, tags',
        categories: ['Data', 'Display'],
        link: '/components/table',
        tone: 'green',
        glyph: 'stripes',
      },
      {
        title: 'Charts',
        note: 'From sparklines to sankey',
        categories: ['Charts'],
        link: '/components/line-chart',
        tone: 'amber',
        glyph: 'pinwheel',
      },
      {
        title: 'Overlays',
        note: 'Dialogs, drawers, toasts',
        categories: ['Overlay', 'Feedback'],
        link: '/components/dialog',
        tone: 'purple',
        glyph: 'pill',
      },
    ],
  },
  {
    label: 'Ship',
    title: 'Skip the boilerplate',
    tiles: [
      {
        title: 'Blocks',
        note: 'Layouts, palettes, wizards',
        categories: ['Blocks'],
        link: '/components/app-layout',
        tone: 'orange',
        glyph: 'bars',
      },
      {
        title: 'Navigation',
        note: 'Tabs, menus, steppers',
        categories: ['Navigation', 'Layout', 'Media'],
        link: '/components/tabs',
        tone: 'sky',
        glyph: 'half',
      },
      {
        title: 'Utilities',
        note: 'Pipes, directives, helpers',
        categories: ['Utilities', 'Misc'],
        link: '/components/breakpoint',
        tone: 'green',
        glyph: 'grid',
      },
    ],
  },
];

export const INSTALL_SNIPPET: LandingCodePart[] = [
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

export const FAQ = [
  {
    header: 'Is tectra free?',
    content: 'Yes. Every package is open source under the MIT license, for personal and commercial apps alike.',
  },
  {
    header: 'Which Angular versions does it support?',
    content: 'Angular 22.2 and newer. The kit is standalone, zoneless and built on signals, and CI tests the lowest versions the packages accept.',
  },
  {
    header: 'Does it work with server rendering?',
    content: 'Every component renders on the server exactly as in the browser and hydrates without a jump. This site is prerendered the same way.',
  },
  {
    header: 'Can I use my own design?',
    content:
      'Start from a preset and change its tokens, override the tokens of one component with dt, add classes with pass-through, or switch a component to unstyled and bring your own CSS.',
  },
  {
    header: 'Will it make my bundle heavy?',
    content: 'Each component is its own entry point and brings only its own tokens and icons, so an app ships what it imports. CI checks the size of every scenario.',
  },
  {
    header: 'How do I start?',
    content: 'Run ng add tectra-ng in an Angular app. It installs the packages, adds provideTectra with a preset and links the fonts.',
  },
];
