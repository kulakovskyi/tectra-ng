# Number

Numbers in templates in the tectra locale — `1,234.5` in English, `1 234,5` in Ukrainian — with any `Intl.NumberFormat` option: fraction digits, percent, units, compact notation. The pipe follows a locale switch and shows `-` instead of `NaN` for an empty or broken value.

```ts
import { TxNumberPipe } from '@tectra-ng/utils/number';
```

```html
{{ order.total | txNumber: { maximumFractionDigits: 2 } }}   <!-- 1,234.57 -->
{{ conversion | txNumber: { style: 'percent' } }}            <!-- 25% -->
{{ visitors | txNumber: { notation: 'compact' } }}           <!-- 1.5K -->
```

## Pipes
| Name | Description |
|---|---|
| txNumber: options? | Formats a number, numeric string or bigint with `Intl.NumberFormat` options; `locale` (the tectra one by default, followed as it changes) and `empty` (`-` for no value) |

## Functions
| Name | Description |
|---|---|
| formatLocaleNumber(value, options?) | The function behind the pipe; `en-US` by default |
