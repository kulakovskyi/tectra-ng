# Country

A country as a flag and its name. The name comes from `Intl.DisplayNames` in the current tectra locale, so it follows `setLocale`. Unknown values are shown as plain text. Also exports the ISO 3166-1 code list (`TX_COUNTRY_CODES`), `countryName`, `countryEmoji` and `isCountryCode`.

Flags are emoji by default — no assets to load. To draw them with a flag set, provide a resolver once:

```ts
provideTxFlags(txFlagIcons)                                  // CSS classes of the flag-icons package: fi fi-ua (+ fis for circles)
provideTxFlags(txFlagImages((code) => `/assets/flags/${code}.svg`)) // your own images
```

## Inputs
| Name | Description |
|---|---|
| country | ISO 3166-1 alpha-2 code, any case (`ua`, `PL`); other text is shown as it is |
| name | Own name instead of the localized one |
| showName | Shows the name next to the flag (on by default); without it the flag is an image named by the country |
| size | `small` (16px), `medium` (20px), `large` (24px) |
| shape | `rectangle` or `circle` (image and class flags) |
| dt | Design tokens of this instance (`country`) |
| pt | Classes and styles of the parts: `root`, `flag`, `name` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
