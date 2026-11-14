import { TxIconName } from '@tectra-ng/icons';
import { TectraStyleName } from '@tectra-ng/themes';
import { InstallExtra } from './install.data';

export const THEMING_STYLE_NOTES: Record<TectraStyleName, string> = {
  tectra: 'The default: crisp borders, medium radius, quiet shadows.',
  soft: 'Pill shapes, filled borderless fields, a glow on focus.',
  edge: 'Sharp corners, strong borders, solid selection.',
  paper: 'Underlined filled fields, raised shadows, focus halos.',
};

export interface ThemingLayer {
  title: string;
  text: string;
  variable: string;
  file: string;
}

export const THEMING_LAYERS: ThemingLayer[] = [
  {
    title: 'Primitives',
    text: 'Raw scales with no meaning: accent and surface palettes, radius, type, motion, layers.',
    variable: '--tx-primary-500',
    file: '@tectra-ng/tokens',
  },
  {
    title: 'Semantic',
    text: 'What a colour is for, in light and in dark: the primary action, a card, a field border.',
    variable: '--tx-primary-base',
    file: 'light / dark',
  },
  {
    title: 'Component',
    text: 'Every value of every component — size, padding, colour per severity and variant. An app gets the variables of a component once it is on the page.',
    variable: '--tx-button-border-radius',
    file: 'preset.components',
  },
  {
    title: 'Instance',
    text: 'The dt input of one element overrides its component tokens, nothing else changes.',
    variable: '[dt]',
    file: 'template',
  },
];

export const THEMING_RECIPES: InstallExtra[] = [
  {
    icon: 'palette',
    title: 'Your brand colour',
    file: 'app.config.ts',
    text: 'Change a few semantic tokens and keep the rest of the preset.',
    language: 'typescript',
    code: `const Brand = definePreset(Tectra, {
  light: { primary: { base: '#0f766e', hover: '#115e59' } },
  dark: { primary: { base: '#2dd4bf', hover: '#5eead4' } },
});

provideTectra({ preset: Brand });`,
  },
  {
    icon: 'objects-column',
    title: 'One component, everywhere',
    file: 'app.config.ts',
    text: 'Component tokens in the preset restyle every instance of it.',
    language: 'typescript',
    code: `const Rounded = definePreset(Tectra, {
  components: {
    button: { root: { borderRadius: '999px' } },
    card: { root: { borderRadius: '24px' } },
  },
});`,
  },
  {
    icon: 'pencil',
    title: 'One element',
    file: 'template.html',
    text: 'The dt input of a single component — its tokens, scoped to it.',
    language: 'xml',
    code: `<button txButton [dt]="{ root: { borderRadius: '0' } }">Square</button>

<tx-badge value="New" [dt]="{ primary: { background: '#0d9488' } }" />`,
  },
  {
    icon: 'moon',
    title: 'Switch at runtime',
    file: 'theme.ts',
    text: 'Change the style, primary, surface or mode while the app runs; every component follows. presetOverrides keeps your own changes, storageKey remembers the choice, and the Theme Configurator block is a ready picker.',
    language: 'typescript',
    code: `import { softStyle } from '@tectra-ng/themes';

provideTectra({ preset: Tectra, storageKey: 'app-theme', styles: [softStyle] });

const theme = inject(TxThemeService);

theme.updateTheme({ style: softStyle, primary: 'violet' });
theme.setMode('dark');
theme.primary(); // 'violet'`,
  },
  {
    icon: 'file',
    title: 'Plain CSS',
    file: 'build-theme.ts',
    text: 'presetToCss writes the variables of light and dark for any page, even without Angular.',
    language: 'typescript',
    code: `import { createTectraPreset, presetToCss } from '@tectra-ng/themes';

const css = presetToCss(createTectraPreset({ primary: 'emerald' }));

writeFileSync('theme.css', css);`,
  },
  {
    icon: 'code',
    title: 'Your own CSS',
    file: 'app.config.ts',
    text: 'Drop the tectra look and keep behaviour and ARIA; add classes per part.',
    language: 'typescript',
    code: `provideTectra({
  preset: Tectra,
  unstyled: true,
  pt: { button: { root: { class: 'btn' } } },
});`,
  },
];

export const THEMING_NEXT: { icon: TxIconName; title: string; text: string; path: string }[] = [
  { icon: 'th-large', title: 'Component tokens', text: 'Every component page has a Theming tab.', path: '/components/button' },
  { icon: 'star', title: 'Icons', text: 'The icon set, its stroke and size.', path: '/icons' },
  { icon: 'download', title: 'Installation', text: 'Packages and the first component.', path: '/getting-started' },
];
