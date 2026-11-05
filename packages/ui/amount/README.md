# Amount

A number or a sum of money formatted for the current locale — grouping, decimals, currency symbol and its position come from `Intl`. Empty values show a dash, zero is muted.

```html
<tx-amount [amount]="1234.5" currency="USD" />
<tx-amount [amount]="delta" [signColor]="true" [showSign]="true" />
```

`format` uses the digits notation `minInteger.minFraction-maxFraction`: `1.0-2` (default, up to two decimals), `1.2-2` (always two), `1.0-0` (whole numbers). `formatAmount(value, options)` returns the formatted parts for own markup.

## Inputs
| Name | Description |
|---|---|
| amount | The number; `null` or `undefined` shows `emptyText` |
| currency | ISO 4217 code (`USD`, `EUR`, `UAH`); an unknown code is shown after the number as is |
| format | Digits: `minInteger.minFraction-maxFraction` |
| notation | `standard` or `compact` (`1.2K`, `3.4M`) |
| currencyDisplay | `narrowSymbol` ($), `symbol` (US$), `code` (USD) or `name` (US dollars) |
| showSign | Adds `+` to positive numbers |
| signColor | Positive numbers green, negative red |
| strong | Bolder number |
| locale | Own `Intl` locale instead of the current tectra locale |
| emptyText | Shown when there is no number |
| dt | Design tokens of this instance (`amount`) |
| pt | Classes and styles of the parts: `root`, `value`, `currency` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
