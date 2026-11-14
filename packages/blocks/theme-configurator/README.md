# Theme configurator

Theme settings people change at run time: primary color, surface palette, style and the click ripple. Each pick rebuilds the theme through `TxThemeService.updateTheme`, so the whole app follows at once.

```html
<tx-theme-configurator [styles]="styles" />
```

```ts
import { edgeStyle, softStyle, tectraStyle } from '@tectra-ng/themes';

readonly styles = [tectraStyle, softStyle, edgeStyle];
```

Styles are objects, and only the ones you list end up in the bundle; with fewer than two the style row is hidden. Put it in a popover, a drawer or a settings page.

## Theme service

`TxThemeService` (`@tectra-ng/core/config`) holds the choice as signals — `style()`, `primary()`, `surface()`, `ripple()`, `mode()` — and `updateTheme({ style, primary, surface })` rebuilds the preset with `createTectraPreset` (parts left out stay). Two `provideTectra` options go with it:

```ts
provideTectra({
  preset: Tectra,
  presetOverrides: { light: { primary: { contrast: '#ffffff' } } },
  storageKey: 'app-theme',
  styles: [softStyle, edgeStyle],
});
```

- `presetOverrides` — your own changes to the preset (an object or `(preset) => overrides`), merged with `definePreset` at start and after every `updateTheme`. Keep them here instead of in `preset` so a new primary or style does not drop them.
- `storageKey` — remembers the style, primary, surface, ripple and color scheme in local storage and restores them while the app starts, before the first render. On the server nothing is read.
- `styles` — the styles a remembered choice may name; the style of `preset` is always known.

## Inputs
| Name | Description |
|---|---|
| styles | Style objects to pick from (`tectraStyle`, `softStyle`, `edgeStyle`, `paperStyle` or your own) |
| primaries | Primary color dots, `{ value, color, label }`; every primary color of `createTectraPreset` by default; an empty list hides the row |
| surfaces | Surface palette dots; every surface palette by default; an empty list hides the row |
| columns | Dots per row (default 9) |
| showRipple | Shows the ripple switch (default `true`) |
| dt | Design tokens of this instance (`themeConfigurator`) |
| pt | Classes and styles of the parts: `root`, `section`, `label`, `swatches`, `segments`, `segment` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| themeChange | `{ style, primary, surface }` after a pick rebuilt the theme |
| rippleChange | The ripple was turned on or off |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between the primary dots, the surface dots, the styles and the ripple switch |
| Arrow keys | Pick the next or previous dot or style |
| Home / End | Pick the first / last dot or style |
| Space | Turns the ripple on or off |
