import { TxIconName } from '@tectra-ng/icons';
import { InstallExtra } from './install.data';

export const ICON_RECIPES: InstallExtra[] = [
  {
    icon: 'code',
    title: 'In a template',
    file: 'template.html',
    text: 'The icon takes the font size and the colour of the text around it.',
    language: 'xml',
    code: `<tx-icon name="trash" />

<tx-icon name="bell" [style.font-size.px]="20" />`,
  },
  {
    icon: 'objects-column',
    title: 'Any icon input',
    file: 'template.html',
    text: 'Buttons, tags, messages, menus and fields take the same names.',
    language: 'xml',
    code: `<button txButton icon="plus">Add</button>

<tx-tag value="Paid" icon="check" severity="success" />

<tx-message severity="warn" icon="exclamation-triangle" text="Check the dates" />`,
  },
  {
    icon: 'sliders-h',
    title: 'Size and stroke',
    file: 'styles.css',
    text: 'Two tokens, set anywhere — on one icon, a toolbar or the whole app.',
    language: 'css',
    code: `.toolbar tx-icon {
  --tx-icon-size: 20px;
  --tx-icon-stroke-width: 1.5;
}`,
  },
  {
    icon: 'sparkles',
    title: 'Your own icons',
    file: 'app.config.ts',
    text: 'Paths on the 24 × 24 grid: a string is stroked, an object can be filled.',
    language: 'typescript',
    code: `provideTxIcons({
  sparkle: ['M12 3v18', 'M3 12h18'],
  'my-logo': [{ d: 'M4 4h16v16H4z', fill: true, stroke: false }],
});`,
  },
  {
    icon: 'star',
    title: 'Brand logos',
    file: 'app.config.ts',
    text: 'An optional package; the logos are registered by name like any icon.',
    language: 'typescript',
    code: `import { provideTxBrandIcons } from '@tectra-ng/brand-icons';

providers: [provideTxBrandIcons()];`,
  },
  {
    icon: 'flag',
    title: 'Country flags',
    file: 'app.config.ts',
    text: 'Each flag is its own small chunk, loaded the first time it is shown.',
    language: 'typescript',
    code: `import { loadTxFlag } from '@tectra-ng/flags';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';

providers: [provideTxFlags(txFlagImages(loadTxFlag))];`,
  },
];

export const ICON_NEXT: { icon: TxIconName; title: string; text: string; path: string }[] = [
  { icon: 'objects-column', title: 'Button', text: 'Icons in buttons, alone or with a label.', path: '/components/button' },
  { icon: 'globe', title: 'Country', text: 'A flag with the localized country name.', path: '/components/country' },
  { icon: 'palette', title: 'Theming', text: 'Tokens, presets and your brand colours.', path: '/theming' },
];
