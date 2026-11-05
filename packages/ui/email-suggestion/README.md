# Email suggestion

A hint under an email field: completes your own domain (`olena` → `olena@example.com`) and catches typos in common domains (`gmial.com` → `gmail.com`). It is a polite live region, so screen readers hear the hint; a click on it emits the fixed address. The logic is also exported as `suggestEmail(value, domains, known)` and `editDistance`. Styled by the button tokens.

## Inputs
| Name | Description |
|---|---|
| value | The typed email |
| domain | Your domain or domains to complete, with or without `@` |
| knownDomains | Domains checked for typos (common mail providers by default) |
| icon | Icon of the hint button |
| pt | Classes and styles of the parts: `root`, `button` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| applied | The hint was used: the suggested address |
