# @tectra-ng/themes

Gives the primitive tokens a meaning. A preset = semantic tokens for light + dark, built from an accent palette and the surface palette.

| File | What it does |
|---|---|
| `semantic/light.semantic.ts`, `semantic/dark.semantic.ts` | which step of which palette is `primary`, `surface.card`, `field.border`, `danger.hover`… in each mode |
| `presets/ink/ink.preset.ts` | `createInkPreset(accent)` — ink surfaces + one of `blue` · `green` · `purple` · `cyan` · `teal`; `InkPreset` = blue |
| `define-preset.ts` | `definePreset(base, overrides)` — deep merge: override one token without copying the rest |
| `components/*.tokens.ts` | design tokens of each component (`button`, `badge`, `toggleButton`) — every size, padding, colour per severity and variant; emitted as `--tx-<component>-…`, overridable per preset or per instance with `[dt]` |
| `preset-to-css.ts` | `presetToCss(preset)` → `:root { --tx-… }` + `:root[data-tx-theme="dark"] { … }` |

Semantic groups (each becomes `--tx-<group>-<key>`): `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`, `surface`, `text`, `field`, `highlight`, `list`, `mask`, `focus-ring`, `shadow`. Shared: `radius`, `space`, `font`, `motion`.

Depends on: `@tectra-ng/tokens`.
