# tectra

Open-source Angular UI kit: tokens, themes, ~70 components and ready blocks for consoles and admin apps.

## Install

```bash
npm install tectra-ng          # everything at one version
npm install @tectra-ng/ui      # or only the components: core, themes, tokens and icons come with them
```

Docs and examples: [tectra-ng.com](https://tectra-ng.com).

## Run

```bash
npm install
npx nx serve docs          # the site on http://localhost:4300
npx nx serve sandbox       # bare playground on http://localhost:4301
npm run build:packages     # npm packages into dist/packages/*
npm run lint               # ESLint + package boundaries
npm run test               # unit tests (Vitest)
npm run e2e                # Playwright checks of the docs site
```

Working now: tokens, themes (light / dark, 5 accents), core (config with unstyled + pass-through, overlay, forms, a11y, i18n, styles, ripple, fluid), icons + brand icons, ui (button, button-group, toggle-button, badge, input, icon-field, input-group, key-filter, select), the docs site, unit tests, Playwright checks and CI.

Plan of what moves in next and in which order: [ROADMAP.md](ROADMAP.md).

## Layout

| Folder | What lives there | Published |
|---|---|---|
| `packages/tokens` | palettes (13 surfaces, 16 accents, severities), radius, typography, shadows — plain data | npm `@tectra-ng/tokens` |
| `packages/themes` | semantic light / dark, component design tokens, `createTectraPreset({ style, primary, surface })` with 4 themes, `definePreset` (deep merge) | npm `@tectra-ng/themes` |
| `packages/core` | behaviour without looks: config (theme, unstyled, pt), overlay, a11y, forms, i18n, styles, ripple, fluid, utils | npm `@tectra-ng/core/*` |
| `packages/icons` | 334 own outline icons (PrimeIcons names) + `<tx-icon>` + icon registry (`provideTxIcons`) | npm `@tectra-ng/icons` |
| `packages/brand-icons` | optional brand logos from Simple Icons (CC0) under PrimeIcons names | npm `@tectra-ng/brand-icons` |
| `packages/flags` | optional country flags as SVG, rectangle and circle, loaded one by one | npm `@tectra-ng/flags` |
| `packages/ui` | components, one entry point each | npm `@tectra-ng/ui/<component>` |
| `packages/blocks` | console-layout, filters-panel, stat-tiles … | npm `@tectra-ng/blocks/<block>` |
| `apps/docs` | the documentation site | Cloudflare Pages |
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
