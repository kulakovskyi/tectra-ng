# @tectra-ng/themes

Gives the primitive tokens a meaning. A preset = semantic tokens for light + dark, built from a primary palette, a surface palette and a style.

| File | What it does |
|---|---|
| `semantic/light.semantic.ts`, `semantic/dark.semantic.ts` | which step of which palette is `primary`, `surface.card`, `field.border`, `danger.hover`… in each mode |
| `presets/tectra.preset.ts` | `createTectraPreset({ style, primary, surface })` — `style` is the style object (`tectraStyle` by default, `edgeStyle`, `paperStyle`; only the one passed lands in the bundle, `TECTRA_STYLES[name]` picks one by name and ships them all), `primary` from `PRIMARY_ORDER` (`noir` follows the surface), `surface` from `SURFACE_PALETTES`; ready presets `Tectra` (default), `Edge`, `Paper` |
| `styles/<name>/` | a style = component token overrides + semantic overrides + optional CSS on top of the default look: `tectra` — the default; `edge` — sharp corners, strong borders, solid selection; `paper` — filled fields with an underline, elevation shadows, focus halos |
| `semantic/contrast.ts` | `primaryBaseStep(scale)` — light primary is step 600, or 700 when white text on 600 is under 4.5:1 |
| `define-preset.ts` | `definePreset(base, overrides)` — deep merge: override one token without copying the rest |
| `components/*.tokens.ts` | design tokens of every component (`button`, `select`, `table`, `datePicker`, …) — every size, padding, colour per severity and variant; emitted as `--tx-<component>-…` once a component of that group is on the page (an app ships only the groups it uses), overridable per preset or per instance with `[dt]`; `preset.components` holds only the overrides of a style or `definePreset` |
| `preset-to-css.ts` | `presetBaseCss(preset)` → `:root { --tx-… }` + `:root[data-tx-theme="dark"] { … }` without component tokens; `componentTokensCss(group, tokens)` → the variables of one component group; `presetToCss(preset)` → everything at once (every component), for a page without Angular |

Semantic groups (each becomes `--tx-<group>-<key>`): `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`, `surface`, `text`, `field`, `highlight`, `list`, `mask`, `focus-ring`, `shadow`, `content`. Shared: `radius`, `space`, `font`, `motion`.

`content` is the frame of a content surface: `--tx-content-radius` (`radius-lg` by default) and `--tx-content-shadow` (a 1–2px shadow of `surface-950` faded 95%). Cards, panels, stat tiles, data views and filters panels take their corner radius and shadow from it, so a style changes them together (`edge` and `paper` give it `radius-sm` and their own shadow). The variables are written on every page, not only where one of those components is, so an app can draw a matching frame of its own:

```css
.summary {
  border: 1px solid var(--tx-surface-border);
  border-radius: var(--tx-content-radius);
  background: var(--tx-surface-card);
  box-shadow: var(--tx-content-shadow);
}
```

For no shadow set `--tx-content-shadow` to `0 0 transparent`, not `none`: the components join it with their border ring.

Depends on: `@tectra-ng/tokens`.
