# Upgrading

## From 0.4.1

Mostly fixes; a few defaults and types changed. The compiler points to every type change.

- **Selected table rows** keep the normal text colour (`table.row.selectedColor` is now `text-primary`); only the background marks the state. The edge style keeps the highlight colour on its solid highlight. Set the token back to `var(--tx-highlight-color)` to keep the old look.
- **Overlays stack in the order they open.** Dialogs, drawers and the image preview now open in the browser top layer like popovers, menus and tooltips, and opening a modal closes the open popovers, menus, select panels and tooltips first. Fixed elements that are not overlays (a cookie notice, a network pill, a speed dial) now stay under a modal's backdrop.
- **`tx-message`** shows `text` and projected content together; before, content was dropped when `text` was set. Put buttons into the new `[txMessageActions]` slot.
- **`txPopoverHeader`** content now sits next to the title instead of inside it, so it no longer names the dialog. A popover that used only the slot as its title needs `ariaLabel`.
- **`tx-tooltip`**: `tooltip.arrow.size` is now how far the arrow sticks out (default `3.5px`, the same look as the old `5px`). Halve an override you set before.
- **`tx-menu`**: a popup menu with the new `arrow` input defaults to `offset` 10.
- **`tx-tabs`**: `scrollable` is unset by default and the scroll buttons appear by themselves when the tabs overflow; `true` and `false` still win. `TxTabsContext.scrollable` is now `Signal<boolean | undefined>`.
- **`tx-table`**: `txTableAction` is no longer a required input (an action without a config is skipped), and a `lazyLoad` that asks for the same data as the last one is not emitted again. In a template typed with the new `txTableCellOf` (and the other `…Of` inputs) the untyped context fields `value` and `node` are `unknown`.
- **Chips** of `tx-multiselect` and `tx-tree-select` (`display="chip"`) stay on one line and count the rest in a `+N` chip; `tx-autocomplete` with `multiple` does the same until the field has focus, then wraps. Set `display="comma"` where you want plain text.
- **`txFilterState`**: `set()` and `patch()` that change no value keep the same `value()` object.
- **File sizes**: `formatFileSize`, `txFileSize` and `tx-file-upload` share one formatter (`formatBytes` of `@tectra-ng/core/i18n`) with unit names in the active language: `512 byte`, `1.5 kB` in English. `fileSizeParts` and `TX_FILE_SIZE_UNITS` are gone from `@tectra-ng/ui/file-upload`.
- **`txDate`** follows the active locale; without a format it shows a medium date in that locale. `TX_DATE_FORMAT_CONFIG.format` also takes `Intl.DateTimeFormat` options.
- **Labels in capitals:** `tx-wizard-progress`, the group titles of `tx-command-palette` and the menu title of `tx-filters-panel` no longer force capitals (a capital letter can read as a digit in some languages); they are 12px, without letter spacing. `commandPalette.results.groupTextTransform` and `filtersPanel.menu.titleTextTransform` bring capitals back.
- **`tx-breadcrumb`**: links carry a light underline that darkens on hover, and an item without a link or command is plain text, so the two are told apart before hover (`breadcrumb.item.linkDecoration: 'none'` removes the underline).
- **`@tectra-ng/blocks`** has a new peer dependency on `@angular/forms` (the theme configurator uses it); it is already in every Angular app.
- **Apps that keep list state in the URL** (`txFilterState({ url: true })`): add `provideTxScrolling()` of `@tectra-ng/utils/scrolling` and keep the router's `scrollPositionRestoration` at `'disabled'` (the default), so paging and sorting no longer scroll the page to the top.

## From 0.3.2

Small changes to the public types. Most apps need none of these steps; the compiler points to every place that does.

- `TxFilterMatchMode` of `@tectra-ng/ui/select` is now `TxSelectFilterMatchMode`, so it no longer shares a name with the wider `TxFilterMatchMode` of `@tectra-ng/ui/table`.
- `TxTreeRow` of `@tectra-ng/ui/tree-select` is now `TxTreeSelectRow`; `TxTreeRow` stays the row of `@tectra-ng/ui/tree`.
- `share` of `tx-treemap` (`tileClick`, `TxTreemapTile`) is now 0–1, like the other charts. Multiply by 100 where you showed it as a percentage; the text of tooltips and tiles is unchanged.
- Unused exports are gone: `TxMenuListOptions` (`@tectra-ng/ui/menu`), `TxCommandPaletteTranslate` (`@tectra-ng/blocks/command-palette`), the axis `line` of `TxChartAxisModel` and the `axis.lineColor` chart token (no axis line was ever drawn).
- Translation keys no component used are gone: `pageReport`, `generatePassword`, `itemsLimit`, `editorLinkText`, `editorLinkOpen`, `codeDiffAdded`, `codeDiffRemoved`, `codeDiffNoChanges`, `filterFrom`, `filterTo`, `editCell`, `wizardSkip`, `chartOfSource`, `chartDrillUp`. Remove them from your own translations.
- `TECTRA_CORE_VERSION`, `TECTRA_UI_VERSION`, `TECTRA_CHARTS_VERSION`, `TECTRA_UTILS_VERSION` and `TECTRA_BLOCKS_VERSION` now hold the installed version instead of `0.0.0`.

## From 0.3.1

The packages need Angular and the CDK **22.2 or newer** (the peer ranges said 22.0, but the panel menu already used a router function that came with 22.2, so 22.0 and 22.1 did not build). On an older 22 minor run `ng update @angular/core@22 @angular/cli@22 @angular/cdk@22` first. CI now builds and tests the packages on the lowest versions they accept.

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
