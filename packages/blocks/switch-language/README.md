# Switch language

A segmented switch of the interface language: short codes in a capsule with a sliding thumb. By default it shows English and Ukrainian and sets the locale of `TxLocaleService`, so every tectra text follows.

```html
<tx-switch-language [(value)]="language" (valueChange)="translate.use($event)" />
```

Give your own list with `languages` (`{ code, name, short }`). With `syncLocale` off the switch only reports the choice. With `syncLocale` on, `provideTectra({ localeStorageKey: 'locale' })` remembers the choice between visits and restores it before the first render, and `provideTxLocaleSync((code) => …)` from `@tectra-ng/core/i18n` mirrors every change into the app's own translations.

## Inputs
| Name | Description |
|---|---|
| languages | Options (`TxLanguageOption[]`: `code`, `name` — the accessible name and the title, `short` — the visible code); English and Ukrainian by default |
| value | Two-way code of the chosen language; follows the current locale while empty |
| syncLocale | Sets the `TxLocaleService` locale on a change (default on) |
| ariaLabel | Name of the group (translated "Language" by default) |
| dt | Design tokens of this instance (`switchLanguage`) |
| pt | Classes and styles of the parts: `root`, `group`, `thumb`, `option` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| valueChange | The code of the chosen language |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves the focus to the chosen language |
| Right / Down, Left / Up | Chooses the next / previous language, wrapping around |
| Home / End | Chooses the first / last language |
