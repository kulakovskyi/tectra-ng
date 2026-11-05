# tectra

Open-source Angular UI kit: tokens, themes, ~70 components and ready blocks for consoles and admin apps.

## Run

```bash
npm install
npx nx serve docs          # the site on http://localhost:4300
npx nx serve sandbox       # bare playground on http://localhost:4301
npm run build:packages     # npm packages into dist/packages/*
```

Working now: tokens, themes (light / dark, 5 accents), core (config with unstyled + pass-through, overlay, forms, a11y, i18n, styles, ripple, fluid), icons, ui (button with the full PrimeNG feature set + design tokens, button-group, toggle-button, badge, input, select), the docs site. Planned: blocks, visual tests (`e2e/visual`), the component generator, CI.

## Layout

| Folder | What lives there | Published |
|---|---|---|
| `packages/tokens` | palettes (ink surfaces, 5 accents, severities), radius, typography, shadows — plain data | npm `@tectra/tokens` |
| `packages/themes` | semantic light / dark, component design tokens, `createInkPreset(accent)`, `definePreset` (deep merge) | npm `@tectra/themes` |
| `packages/core` | behaviour without looks: config (theme, unstyled, pt), overlay, a11y, forms, i18n, styles, ripple, fluid, utils | npm `@tectra/core/*` |
| `packages/icons` | 334 own outline icons (PrimeIcons names) + `<tx-icon>` + icon registry (`provideTxIcons`) | npm `@tectra/icons` |
| `packages/brand-icons` | optional brand logos from Simple Icons (CC0) under PrimeIcons names | npm `@tectra/brand-icons` |
| `packages/ui` | components, one entry point each | npm `@tectra/ui/<component>` |
| `packages/blocks` | console-layout, filters-panel, stat-tiles … | npm `@tectra/blocks/<block>` |
| `apps/docs` | the site (like primeng.org) | Cloudflare Pages |
| `apps/sandbox` | local playground | — |
| `e2e/visual` | Playwright screenshots + axe | — |
| `tools` | Nx generators, docs extractors, AI docs | — |

## Dependency direction

```
tokens → themes → core → ui → blocks
                          ↓      ↓
                 apps/docs, apps/sandbox, e2e/visual
```

A package never imports anything to its right; packages never import apps.

## One example = four uses

`apps/docs/src/content/components/select/examples/basic.example.ts` is:

1. rendered live on the docs page,
2. shown as source in the "Code" tab,
3. opened in StackBlitz,
4. screenshotted by `e2e/visual`.

## A new component

Planned: `nx g tools:component select` creates `packages/ui/select/*`, `apps/docs/src/content/components/select/*` and a visual test — the component shows up on the site.
