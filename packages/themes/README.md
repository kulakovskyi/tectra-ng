# @tectra-ng/themes

Gives the primitive tokens a meaning. A preset = semantic tokens for light + dark, built from a primary palette, a surface palette and a style.

| File | What it does |
|---|---|
| `semantic/light.semantic.ts`, `semantic/dark.semantic.ts` | which step of which palette is `primary`, `surface.card`, `field.border`, `danger.hover`… in each mode |
| `presets/tectra.preset.ts` | `createTectraPreset({ style, primary, surface })` — `style` from `TECTRA_STYLES` (`tectra` · `soft` · `edge` · `paper`), `primary` from `PRIMARY_ORDER` (`noir` follows the surface), `surface` from `SURFACE_PALETTES`; ready presets `Tectra` (default), `Soft`, `Edge`, `Paper` |
| `styles/<name>/` | a style = component token overrides + semantic overrides + optional CSS on top of the default look: `tectra` — the default; `soft` — pill buttons, tags and segments, filled borderless fields, tonal secondary buttons, large card and overlay radii, glow focus; `edge` — sharp corners, strong borders, solid selection; `paper` — filled fields with an underline, elevation shadows, focus halos |
| `semantic/contrast.ts` | `primaryBaseStep(scale)` — light primary is step 600, or 700 when white text on 600 is under 4.5:1 |
| `define-preset.ts` | `definePreset(base, overrides)` — deep merge: override one token without copying the rest |
| `components/*.tokens.ts` | design tokens of every component (`button`, `select`, `table`, `datePicker`, …) — every size, padding, colour per severity and variant; emitted as `--tx-<component>-…`, overridable per preset or per instance with `[dt]` |
| `preset-to-css.ts` | `presetToCss(preset)` → `:root { --tx-… }` + `:root[data-tx-theme="dark"] { … }` |

Semantic groups (each becomes `--tx-<group>-<key>`): `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`, `surface`, `text`, `field`, `highlight`, `list`, `mask`, `focus-ring`, `shadow`. Shared: `radius`, `space`, `font`, `motion`.

Depends on: `@tectra-ng/tokens`.
