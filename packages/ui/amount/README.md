# Amount

A number or a sum of money formatted for the current locale — grouping, decimals, currency symbol and its position come from `Intl`. Empty values show a dash, zero is muted.

```html
<tx-amount [amount]="1234.5" currency="USD" />
<tx-amount [amount]="delta" [signColor]="true" [showSign]="true" />
```

`format` uses the digits notation `minInteger.minFraction-maxFraction`: `1.0-2` (up to two decimals), `1.2-2` (always two), `1.0-0` (whole numbers). Without it a sum of money shows the digits of its currency (`$318.60`, `¥318`) and a plain number shows up to two decimals. `formatAmount(value, options)` returns the formatted parts for own markup.

App-wide defaults — a number locale apart from the language of the interface, the place of the currency and own currency texts:

```ts
provideTxAmount({ locale: 'uk-UA', symbolPosition: 'after', symbols: { USDT: 'USDT', BTC: '₿' } })
```

## Inputs
| Name | Description |
|---|---|
| amount | The number; `null` or `undefined` shows `emptyText` |
| currency | ISO 4217 code (`USD`, `EUR`, `UAH`); an unknown code is shown after the number as is |
| format | Digits: `minInteger.minFraction-maxFraction`; by default the currency's own digits, or `1.0-2` without a currency |
| notation | `standard` or `compact` (`1.2K`, `3.4M`) |
| currencyDisplay | `narrowSymbol` ($), `symbol` (US$), `code` (USD) or `name` (US dollars) |
| showSign | Adds `+` to positive numbers |
| signColor | Positive numbers green, negative red |
| strong | Bolder number |
| locale | Own `Intl` locale instead of the current tectra locale (or the `locale` of `provideTxAmount`) |
| symbolPosition | Where the currency goes: `auto` (as the locale writes it, by default), `before` or `after` the number, in any locale |
| symbols | Own currency texts by code, e.g. `{ USDT: '₮' }`; merged over the `symbols` of `provideTxAmount` |
| emptyText | Shown when there is no number |
| dt | Design tokens of this instance (`amount`) |
| pt | Classes and styles of the parts: `root`, `value`, `currency` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Providers
| Name | Description |
|---|---|
| provideTxAmount({ locale?, symbolPosition?, symbols? }) | App-wide defaults of every `tx-amount`: the `Intl` locale of numbers, where the currency goes, own currency texts by code |

## Functions
| Name | Description |
|---|---|
| formatAmount(value, options) | The formatted parts `{ text, currency }` for own markup; options: `locale`, `currency`, `format`, `notation`, `currencyDisplay`, `showSign`, `symbolPosition`, `symbols` |
