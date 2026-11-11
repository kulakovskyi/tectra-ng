import { TxIconName } from '@tectra-ng/icons';
import { CodeLanguage } from '../doc-ui/code-block/code-block.types';

export type InstallManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface InstallPackage {
  name: string;
  title: string;
  text: string;
  required?: boolean;
  separate?: boolean;
}

export interface InstallNote {
  icon: TxIconName;
  title: string;
  text: string;
}

export interface InstallExtra extends InstallNote {
  file: string;
  code: string;
  language: CodeLanguage;
}

export const INSTALL_MANAGERS: { value: InstallManager; label: string; add: string }[] = [
  { value: 'npm', label: 'npm', add: 'npm install' },
  { value: 'pnpm', label: 'pnpm', add: 'pnpm add' },
  { value: 'yarn', label: 'yarn', add: 'yarn add' },
  { value: 'bun', label: 'bun', add: 'bun add' },
];

export const INSTALL_ALL = 'tectra-ng';

export const INSTALL_PACKAGES: InstallPackage[] = [
  { name: '@tectra-ng/ui', title: 'Components', text: 'Every component, one entry point each. Core, themes, tokens and icons come with it.', required: true },
  { name: '@tectra-ng/blocks', title: 'Blocks', text: 'Layouts, filters, kanban, wizard, command palette and more.' },
  { name: '@tectra-ng/brand-icons', title: 'Brand logos', text: 'Logos of well-known brands for the icon component.' },
  { name: '@tectra-ng/flags', title: 'Country flags', text: 'Flags for the country select, loaded one by one.' },
  { name: '@tectra-ng/charts', title: 'Charts', text: 'Line, column, combo, scatter, pie, radar, radial bar, gauge, funnel, waterfall, bullet, candlestick, box plot, range area, gantt, sankey, sunburst, bar list, segmented bar, heatmap, treemap, rank and org charts drawn as SVG, no chart library; SVG / PNG / CSV download.' },
  { name: '@tectra-ng/utils', title: 'Utilities', text: 'Date, relative time, plural and file size pipes; debounced input, copy, in view and drag scroll directives; validators, filter state, HTTP params, retries and polling.' },
  { name: '@tectra-ng/qr', title: 'QR codes', text: 'Own encoder in plain TypeScript, no dependencies.' },
  { name: '@tectra-ng/editor', title: 'Rich text editor', text: 'Its own package — tectra-ng does not include it.', separate: true },
];

export const INSTALL_REQUIREMENTS: InstallNote[] = [
  { icon: 'bolt', title: 'Angular 22', text: 'With @angular/cdk, forms and router of the same version.' },
  { icon: 'objects-column', title: 'Standalone', text: 'No NgModules — import components where you use them.' },
  { icon: 'server', title: 'Server rendering', text: 'Prerender and hydrate without extra setup.' },
  { icon: 'sliders-h', title: 'Signals', text: 'Signal inputs and models, OnPush, zoneless-ready.' },
];

export const INSTALL_USE_CODE = `import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: \`<tx-select [options]="cities" [formControl]="city" placeholder="Pick a city" />\`,
})
export class CityField {
  readonly cities = ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'];
  readonly city = new FormControl<string | null>(null);
}`;

export const INSTALL_EXTRAS: InstallExtra[] = [
  {
    icon: 'text',
    title: 'Fonts',
    file: 'index.html',
    text: 'Onest and JetBrains Mono in index.html. Without them the system font is used.',
    language: 'xml',
    code: `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=JetBrains+Mono:wght@400;500&display=swap"
/>`,
  },
  {
    icon: 'moon',
    title: 'Dark mode',
    file: 'app.config.ts',
    text: 'Start in a mode, then switch at runtime — every component follows.',
    language: 'typescript',
    code: `provideTectra({ preset: Tectra, mode: 'dark' });

inject(TxThemeService).toggleMode();`,
  },
  {
    icon: 'globe',
    title: 'Language',
    file: 'app.config.ts',
    text: 'Built-in English and Ukrainian texts; switch or add your own.',
    language: 'typescript',
    code: `provideTectra({ preset: Tectra, locale: 'ua' });

inject(TxLocaleService).setLocale('us');`,
  },
  {
    icon: 'flag',
    title: 'Brand logos and flags',
    file: 'app.config.ts',
    text: 'Register them once; they load only when shown.',
    language: 'typescript',
    code: `import { provideTxBrandIcons } from '@tectra-ng/brand-icons';
import { loadTxFlag } from '@tectra-ng/flags';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';

providers: [
  provideTxBrandIcons(),
  provideTxFlags(txFlagImages(loadTxFlag)),
];`,
  },
  {
    icon: 'pencil',
    title: 'Rich text editor',
    file: 'note-field.ts',
    text: 'Install it next to the kit and import the component.',
    language: 'typescript',
    code: `import { TxEditor } from '@tectra-ng/editor';

@Component({
  imports: [TxEditor],
  template: \`<tx-editor [(html)]="text" height="320px" />\`,
})
export class NoteField {
  readonly text = signal('<p>Hello</p>');
}`,
  },
  {
    icon: 'cog',
    title: 'Global options',
    file: 'app.config.ts',
    text: 'One place for the defaults of every component: ripple, overlay insets, form messages, extra classes.',
    language: 'typescript',
    code: `provideTectra({
  preset: Tectra,
  ripple: true,
  overlay: { viewportInsets: { top: 64 } },
  validationMessages: { required: 'Fill this in' },
  pt: { button: { root: { class: 'app-button' } } },
});`,
  },
];

export const INSTALL_NEXT: { icon: TxIconName; title: string; text: string; path: string }[] = [
  { icon: 'palette', title: 'Theming', text: 'Tokens, presets and your brand colours.', path: '/theming' },
  { icon: 'th-large', title: 'Components', text: 'Every component with live examples.', path: '/components/button' },
  { icon: 'objects-column', title: 'Blocks', text: 'Ready layouts and page parts.', path: '/components/app-layout' },
];
