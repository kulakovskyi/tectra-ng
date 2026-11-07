# tectra-ng

The whole tectra Angular UI kit in one install.

```bash
npm i tectra-ng
```

It installs every tectra package at the same version. Import from the packages themselves:

```ts
import { provideTectra } from '@tectra-ng/core/config';
import { TxButton } from '@tectra-ng/ui/button';
import { Tectra } from '@tectra-ng/themes';
```

| Package | What it holds |
|---|---|
| `@tectra-ng/ui` | Components, one entry point per component: `@tectra-ng/ui/button`, `@tectra-ng/ui/select`, … |
| `@tectra-ng/core` | `provideTectra`, overlay, accessibility helpers, forms, locale |
| `@tectra-ng/themes` | Light and dark themes, presets, component tokens |
| `@tectra-ng/tokens` | Design tokens: palettes, radius, typography, shadows, motion |
| `@tectra-ng/icons` | Icon set and `TxIcon` |
| `@tectra-ng/brand-icons` | Brand logos for `TxIcon` |
| `@tectra-ng/flags` | Country flags for `TxCountry` and `TxCountrySelect` |

Need only part of it? Install a package on its own — `npm i @tectra-ng/ui` brings `core`, `themes`, `tokens` and `icons` with it.

The rich text editor is not part of `tectra-ng` — it carries the ProseMirror engine, so it is installed only where it is used:

```bash
npm i @tectra-ng/editor
```

Docs and examples: [tectra-ng.com](https://tectra-ng.com).
