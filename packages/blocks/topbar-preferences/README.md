# Topbar preferences

The language switch and the theme button together: in one capsule for a top bar, or as labelled rows for a menu or a drawer.

```html
<tx-topbar-preferences raised (languageChange)="saveLanguage($event)" (modeChange)="saveMode($event)" />
<tx-topbar-preferences layout="stacked" />
```

It is built from `tx-switch-language` and `tx-switch-theme`; see their pages for the behaviour.

## Inputs
| Name | Description |
|---|---|
| layout | `inline` — one capsule (default); `stacked` — "Language" and "Theme" rows |
| raised | The capsule on the card colour with a shadow, the chosen language in the primary colour — for a top bar over content |
| languages | Options of the language switch (English and Ukrainian by default) |
| syncLocale | The language switch sets the `TxLocaleService` locale (default on) |
| dt | Design tokens of this instance (`topbarPreferences`) |
| pt | Classes and styles of the parts: `root`, `capsule`, `divider`, `stack`, `row`, `label` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| languageChange | The code of the chosen language |
| modeChange | The new theme mode |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between the language switch and the theme button |
| Arrows / Home / End | Choose a language |
| Enter / Space | On the theme button: switches the theme |
