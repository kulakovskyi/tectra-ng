# Currency

The sign of any ISO 4217 currency — `$`, `€`, `₴`, `¥`, `zł` — from the browser's `Intl` data in the tectra locale, the short code, or its name. An unknown code comes back as it is.

```html
<span>{{ price.amount }} {{ price.currency | txCurrencySymbol }}</span>
```

## Pipes
| Name | Description |
|---|---|
| txCurrencySymbol: display?, locale? | `narrowSymbol` (default: `$`, `₴`), `symbol` (`CA$`, `UAH` in some locales), `code` or `name` ("Ukrainian Hryvnia"); follows the tectra locale |

## Functions
| Name | Description |
|---|---|
| currencySymbol(code, locale?, display?) | The function behind the pipe; `en-US` and `narrowSymbol` by default; cached |
