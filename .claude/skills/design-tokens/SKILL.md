---
name: design-tokens
description: Use when adding or changing tectra design tokens — primitives in @tectra-ng/tokens, semantic light/dark tokens, component tokens in @tectra-ng/themes, presets (createInkPreset, definePreset), CSS variable names, dt on a component, dark mode.
---

# Design tokens in tectra

## Layers

1. **Primitives** — `packages/tokens/src/` (`primitives/`, `palettes/`): colour scales (ink surface + accents + severity palettes), radius, typography, shadows, motion, layers. Raw values, no meaning.
2. **Semantic** — `packages/themes/src/semantic/{light,dark}.semantic.ts`, typed by `types/semantic-tokens.interface.ts`: `primary-*`, `surface-*`, `text-primary` / `text-muted`, `danger-base`, `focus-ring`, `form-field-*`… Meaning, per colour scheme.
3. **Component** — `packages/themes/src/components/<name>.tokens.ts`: what one component uses, built from semantic tokens.
4. **Preset** — `packages/themes/src/presets/ink/ink.preset.ts`: `createInkPreset(accent)` bundles everything; `definePreset(base, overrides)` deep-merges; `presetToCss(preset)` writes the CSS; `provideTectra({ preset })` applies it.

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

## Adding component tokens

1. Create `<name>.tokens.ts` (object + `export type Tectra<Name>Tokens = typeof <name>Tokens`).
2. Register in `components/component-tokens.ts` (`COMPONENT_TOKENS`, camelCase key).
3. Export from `packages/themes/src/index.ts`.
4. In SCSS use only `var(--tx-<name>-…)`. Panels rendered in an overlay set their variables on the panel element, not on `:host`.
5. The component's `dt` input is `TectraDeepPartial<Tectra<Name>Tokens>`; `toStyleObject(dt, '--tx-<name>')`.
6. List the registry key in the docs overview front matter `tokens:` so the Theming tab shows them.
7. Shared field look: fields use `formField` tokens (`form-field.tokens.ts`) — extend those instead of adding per-field copies.

## Rules

- Every visual value of a component (colour, border, radius, padding, font size / weight, shadow, transition) is a token — a theme must be able to change it without CSS overrides.
- Severity variants (`primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`) map to the severity palettes the same way in every component.
- Contrast: text tokens must pass WCAG AA on their background in both schemes (axe checks it in e2e). Muted text is `surface-600`-level, not lighter.
- Changing a semantic or primitive token affects every component — run the whole `verify` skill, look at the docs Theming page in both themes.
- Unit tests for presets / merging live in `packages/themes/src/*.spec.ts`.
