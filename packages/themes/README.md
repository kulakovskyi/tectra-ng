# @tectra/themes

Gives the primitive tokens a meaning. A preset = semantic tokens for light + dark, built from an accent palette and the surface palette.

| File | What it does |
|---|---|
| `semantic/light.semantic.ts`, `semantic/dark.semantic.ts` | which step of which palette is `primary`, `surface.card`, `field.border`, `danger.hover`… in each mode |
| `presets/ink/ink.preset.ts` | `createInkPreset(accent)` — ink surfaces + one of `blue` · `green` · `purple` · `cyan` · `teal`; `InkPreset` = blue |
| `define-preset.ts` | `definePreset(base, overrides)` — your own preset on top of another |
| `preset-to-css.ts` | `presetToCss(preset)` → `:root { --tx-… }` + `:root[data-tx-theme="dark"] { … }` |

Semantic groups (each becomes `--tx-<group>-<key>`): `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `surface`, `text`, `field`, `highlight`, `list`, `mask`, `focus-ring`, `shadow`. Shared: `radius`, `space`, `font`, `motion`.

Depends on: `@tectra/tokens`.
