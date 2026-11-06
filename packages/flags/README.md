# @tectra-ng/flags

Country flags as SVG for `<tx-country>` and `<tx-country-select>`: every ISO 3166-1 country in two shapes — `rectangle` (4:3) and `circle` (1:1 artwork for round flags).

```ts
import { loadTxFlag } from '@tectra-ng/flags';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';

provideTxFlags(txFlagImages(loadTxFlag))
```

Nothing to copy into `assets` and no stylesheet to include. Each flag is a separate chunk, fetched only when a flag is shown and cached after that, so a page with three flags downloads three small files.

| Export | What it does |
|---|---|
| `loadTxFlag(code, shape?)` | `Promise<string \| null>` — a `data:image/svg+xml` URL of the flag, cached; `null` for an unknown code |
| `loadTxFlagSvg(code, shape?)` | `Promise<string \| null>` — the SVG markup itself, e.g. to inline it |
| `isTxFlagCode(code)` | Whether the set has this code (any case) |
| `TX_FLAG_CODES` / `TxFlagCode` | Every code in the set — ISO countries plus regions such as `eu`, `un`, `gb-eng`, `gb-sct`, `es-ct` (for your own use; `tx-country` takes ISO codes) |

## Source

The artwork is generated from [flag-icons](https://github.com/lipis/flag-icons) (MIT, © Panayiotis Lipiridis) with `npm run flags` (`tools/flags/build-flags.mjs`, optimised with SVGO). `flag-icons` is only a development dependency of the repository; this package has no dependencies. Its notice is kept in `LICENSE`.
