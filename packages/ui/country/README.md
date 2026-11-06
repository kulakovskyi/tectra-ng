# Country

A country as a flag and its name. The name comes from `Intl.DisplayNames` in the current tectra locale, so it follows `setLocale`. Unknown values are shown as plain text. Also exports the ISO 3166-1 code list (`TX_COUNTRY_CODES`), `countryName`, `countryEmoji` and `isCountryCode`.

Flags are emoji by default — no assets to load. To draw them as images, provide a resolver once. The tectra flag set, loaded flag by flag on demand:

```ts
import { loadTxFlag } from '@tectra-ng/flags';

provideTxFlags(txFlagImages(loadTxFlag))
```

Other sources:

```ts
provideTxFlags(txFlagImages((code, shape) => `/assets/flags/${shape}/${code}.svg`)) // your own images; the function may return a Promise
provideTxFlags(txFlagIcons)                                                        // CSS classes fi fi-ua (+ fis for circles) of a flag stylesheet you include
```

While an async flag loads, its box is already there (the `loading-background` token), so the row does not move; a missing flag falls back to the emoji.

## Inputs
| Name | Description |
|---|---|
| country | ISO 3166-1 alpha-2 code, any case (`ua`, `PL`); other text is shown as it is |
| name | Own name instead of the localized one |
| showName | Shows the name next to the flag (on by default); without it the flag is an image named by the country |
| size | `small` (follows the text, 1em), `medium` (17.5px), `large` (28px) |
| shape | `rectangle` or `circle` (image and class flags) |
| dt | Design tokens of this instance (`country`) |
| pt | Classes and styles of the parts: `root`, `flag`, `name` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
