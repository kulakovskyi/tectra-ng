---
name: design-tokens
description: Use when adding or changing tectra design tokens — primitives in @tectra-ng/tokens, semantic light/dark tokens, component tokens in @tectra-ng/themes, presets and themes (createTectraPreset, styles, definePreset), CSS variable names, dt on a component, dark mode.
---

# Design tokens in tectra

## Layers

1. **Primitives** — `packages/tokens/src/` (`primitives/`, `palettes/`): colour scales (ink surface + accents + severity palettes), radius, typography, shadows, motion, layers. Raw values, no meaning.
2. **Semantic** — `packages/themes/src/semantic/{light,dark}.semantic.ts`, typed by `types/semantic-tokens.interface.ts`: `primary-*`, `surface-*`, `text-primary` / `text-muted`, `danger-base`, `focus-ring`, `form-field-*`… Meaning, per colour scheme.
3. **Component** — `packages/themes/src/components/<name>.tokens.ts`: what one component uses, built from semantic tokens.
4. **Preset** — `packages/themes/src/presets/tectra.preset.ts`: `createTectraPreset({ style, primary, surface })` bundles everything (`Tectra` = default). A style (`packages/themes/src/styles/<name>/`) = component token overrides per group + semantic overrides + optional CSS on top of the default look; the default `tectra` style must never change when a style is added — new geometry tokens get the current hard-coded value as default; `definePreset(base, overrides)` deep-merges; `preset.components` holds only overrides (of the style and `definePreset`), never the defaults. `provideTectra({ preset })` writes the base CSS (`presetBaseCss`) and `TxThemeService` writes the variables of a component group only once a component registers it (`injectTokens`), one `<style id="tectra-tokens-<group>">` per group; `presetToCss(preset)` still writes everything at once for static use.

## CSS variable names

`--tx-<component-kebab>-<path-kebab>`; a `root` key is dropped from the path.

```ts
export const chipTokens = {
  root: { borderRadius: tokenRef('radius-full'), gap: '6px' },   // --tx-chip-border-radius, --tx-chip-gap
  removeIcon: { size: '12px' },                                   // --tx-chip-remove-icon-size
  sm: { fontSize: tokenRef('font-size-sm') },                     // --tx-chip-sm-font-size
};
export type TectraChipTokens = typeof chipTokens;
```

Registry key `floatLabel` → prefix `--tx-float-label`. Semantic tokens are `--tx-<name>` (`--tx-primary-base`, `--tx-text-muted`).

## Helpers (`components/token-helpers.ts`)

- `tokenRef('text-muted')` → `var(--tx-text-muted)` — always reference semantic tokens, never copy their values.
- `lightDark(light, dark)` → `light-dark(…)` for values that differ per scheme inside a component token.
- `mix(color, '30%', base)`, `fade(color, '80%')` → `color-mix(…)` for hover / soft fills.
- `joinCss(...parts)` for a value built from parts (`joinCss('0 0 0 1px ', tokenRef('surface-border'))`), `extendTokens(base, extra)` instead of `{ ...base }`.
- Tree-shaking: a token file is only dropped from an app when evaluating it has no side effects. At the top level of a token file use no template literal with `${…}`, no spread, no property access (`PALETTE.cyan[400]`) — use the helpers above; a local helper function called at the top level gets the `/* @__NO_SIDE_EFFECTS__ */` annotation (the only comment allowed in code). `npm run size` shows what an app pays.

## Adding component tokens

1. Create `<name>.tokens.ts` (object + `export type Tectra<Name>Tokens = typeof <name>Tokens`).
2. Register in `components/component-tokens.ts` (`COMPONENT_TOKENS`, camelCase key).
3. Export from `packages/themes/src/index.ts`.
4. In SCSS use only `var(--tx-<name>-…)`; run `npm run themes:groups` — it lists the groups an entry point uses in `<name>.theme.ts` (from its TS, templates and SCSS with `@use`) and adds `injectTokens(…)` to its components (CI fails when a list is out of date; the docs e2e fails on a `var(--tx-…)` without a value). Panels rendered in an overlay set their variables on the panel element, not on `:host`.
5. The component's `dt` input is `TectraDeepPartial<Tectra<Name>Tokens>`; `toStyleObject(dt, '--tx-<name>')`.
6. List the registry key in the docs overview front matter `tokens:` so the Theming tab shows them.
7. Shared field look: fields use `formField` tokens (`form-field.tokens.ts`) — extend those instead of adding per-field copies.

## Rules

- Every visual value of a component (colour, border, radius, padding, font size / weight, shadow, transition) is a token — a theme must be able to change it without CSS overrides.
- Severity variants (`primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`) map to the severity palettes the same way in every component.
- Contrast: text tokens must pass WCAG AA on their background in both schemes (axe checks it in e2e). Muted text is `surface-600`-level, not lighter.
- Changing a semantic or primitive token affects every component — run the whole `verify` skill, look at the docs Theming page in both themes.
- Changing a style (`styles/<name>`) or adding one: run `TX_E2E_ALL_STYLES=1 npx playwright test themes.spec.ts` in `e2e/visual` — every page in every style, light and dark, axe contrast included. A new style goes into `STYLES` of `themes.spec.ts`. Components and examples that sit on `highlight-background` must also read on a solid highlight (Edge); use `primary-soft` for a tint.
- Unit tests for presets / merging live in `packages/themes/src/*.spec.ts`.
