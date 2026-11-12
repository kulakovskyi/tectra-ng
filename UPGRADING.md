# Upgrading

## From 0.2

The next release makes an app ship only the parts of the kit it uses: the tokens of its components, its own style, its icons and its language. A new app set up with `ng add tectra-ng` or the [Getting started](https://tectra-ng.com/getting-started) page needs nothing below. An existing app takes these steps.

### 1. Register the icons your templates use

Components bring the icons they draw themselves (chevrons, close, spinner…). The names your own code passes — `icon="plus"` on a button, `<tx-icon name="trash">`, `icon` of menu items, tags and messages — are registered once in `app.config.ts`:

```ts
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

providers: [provideTectra({ preset }), provideTxIcons(TX_ICONS)];
```

`TX_ICONS` is the whole set. To ship only what you use, list the icons — every icon is its own constant, `txIcon` + the name in PascalCase:

```ts
import { txIconPlus, txIconTrash } from '@tectra-ng/icons';

provideTxIcons({ plus: txIconPlus, trash: txIconTrash });
```

A name nobody registered draws nothing; in development the console names it.

### 2. Pass the style itself, not its name

```ts
// before
createTectraPreset({ style: 'soft', primary: 'violet' });

// after
import { createTectraPreset, softStyle } from '@tectra-ng/themes';

createTectraPreset({ style: softStyle, primary: 'violet' });
```

The styles are `tectraStyle` (the default), `softStyle`, `edgeStyle` and `paperStyle`; `Soft`, `Edge` and `Paper` are still ready presets. To pick a style by name at runtime, look it up — the app then ships every style: `createTectraPreset({ style: TECTRA_STYLES[name] })`. A name passed as `style` throws an error that says this.

### 3. Languages

- `provideTectra({ locale: 'ua' })` works as before; the language is loaded before the app starts.
- `setLocale('ua')` loads the language on first use and returns a promise — `await` it before reading translated texts in code.
- `TX_LOCALE_UA` moved to `@tectra-ng/core/i18n/ua`; `TX_LOCALES` is gone. To switch without waiting for a chunk, register a locale up front: `provideTectra({ preset, locales: [TX_LOCALE_UA] })`.

### 4. Presets and component tokens

- `preset.components` holds only the overrides of the preset's style and of `definePreset` — the defaults are in `COMPONENT_TOKENS`. `definePreset(preset, { components: { button: … } })`, `dt` and `pt` work as before.
- The CSS variables of a component (`--tx-button-…`) are written once a component of that kind is on the page. Your own CSS should use the semantic tokens (`--tx-primary-base`, `--tx-text-muted`, `--tx-surface-border`…), which are always there.
- `presetToCss(preset)` still writes every variable at once, for a page without Angular.

### Also good to know

- The date, number and options editors of the table's filters and cells load on first use; until then a read-only field of the same size holds their place.
- Every docs example has an "Open in StackBlitz" button with the theme you picked on the site.
