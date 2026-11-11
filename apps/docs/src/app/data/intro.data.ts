import { TxIconName } from '@tectra-ng/icons';

export interface IntroLink {
  icon: TxIconName;
  title: string;
  text: string;
  path: string;
}

export interface IntroPackage {
  name: string;
  text: string;
  path: string;
  own?: boolean;
}

export interface IntroPrinciple {
  icon: TxIconName;
  title: string;
  text: string;
}

export const INTRO_START: IntroLink[] = [
  { icon: 'download', title: 'Installation', text: 'Install the packages, provide a theme and render the first component.', path: '/getting-started' },
  { icon: 'palette', title: 'Theming', text: 'Light and dark, primary and surface colours, styles and design tokens.', path: '/theming' },
  { icon: 'th-large', title: 'Icons', text: 'Search the icon set, brand logos and country flags.', path: '/icons' },
  { icon: 'objects-column', title: 'Blocks', text: 'Layouts, filters, kanban, wizard, command palette and more, ready to drop in.', path: '/components/app-layout' },
];

export const INTRO_STEPS = [
  { title: 'Install', language: 'bash' as const, code: 'npm install tectra-ng' },
  {
    title: 'Provide a theme',
    language: 'typescript' as const,
    code: `import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: Tectra })],
};`,
  },
  {
    title: 'Use a component',
    language: 'typescript' as const,
    code: `import { TxButton } from '@tectra-ng/ui/button';

@Component({
  imports: [TxButton],
  template: \`<button txButton icon="check">Save</button>\`,
})`,
  },
];

export const INTRO_PACKAGES: IntroPackage[] = [
  { name: 'tectra-ng', text: 'Everything below at one version — the simplest way to start.', path: '/getting-started' },
  { name: '@tectra-ng/ui', text: 'The components, one entry point each, so only what you import is bundled.', path: '/components/button' },
  { name: '@tectra-ng/blocks', text: 'Ready page blocks built from the components: layouts, filters, kanban, wizard.', path: '/components/app-layout' },
  { name: '@tectra-ng/core', text: 'Config, overlay, accessibility helpers, forms and locale.', path: '/core/overlay' },
  { name: '@tectra-ng/themes', text: 'Light and dark themes, presets and the design tokens of every component.', path: '/theming' },
  { name: '@tectra-ng/tokens', text: 'Palettes, radius, typography, shadows and motion as plain data.', path: '/theming' },
  { name: '@tectra-ng/icons', text: 'The icon set and the TxIcon component.', path: '/icons' },
  { name: '@tectra-ng/brand-icons', text: 'Brand logos for TxIcon.', path: '/icons' },
  { name: '@tectra-ng/flags', text: 'Country flags, loaded one by one.', path: '/components/country' },
  { name: '@tectra-ng/charts', text: 'SVG charts without a chart library: line, column, pie, bar list, segmented bar, heatmap, treemap, rank and org charts, rendered on the server.', path: '/components/line-chart' },
  { name: '@tectra-ng/qr', text: 'QR codes in plain TypeScript with no dependencies.', path: '/components/qr-code' },
  { name: '@tectra-ng/editor', text: 'The rich text editor. Installed on its own — it carries its engine core.', path: '/components/editor', own: true },
];

export const INTRO_PRINCIPLES: IntroPrinciple[] = [
  { icon: 'bolt', title: 'Signals and zoneless', text: 'Standalone components, OnPush and signal inputs. No legacy APIs.' },
  { icon: 'palette', title: 'Tokens everywhere', text: 'Every colour, size and motion is a CSS variable you can change.' },
  { icon: 'sliders-h', title: 'dt · pt · unstyled', text: 'Restyle one instance, one part or the whole app — or drop our styles.' },
  { icon: 'server', title: 'Rendered on the server', text: 'Every component prerenders and hydrates without a jump.' },
  { icon: 'shield', title: 'Accessible by default', text: 'Keyboard maps, ARIA and focus rings, checked by axe in both themes.' },
  { icon: 'box', title: 'Light on dependencies', text: 'Angular and its CDK only. The editor alone brings an engine core.' },
];
