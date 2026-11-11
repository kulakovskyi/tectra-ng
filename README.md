# tectra

Open-source Angular UI kit: tokens, themes, ~70 components and ready blocks for consoles and admin apps.

## Install

```bash
npm install tectra-ng          # everything at one version
npm install @tectra-ng/ui      # or only the components: core, themes, tokens and icons come with them
npm install @tectra-ng/blocks  # or only the ready page blocks (filters panel, page header, layouts …); part of tectra-ng
npm install @tectra-ng/editor  # the rich text editor — its own package, not part of tectra-ng
npm install @tectra-ng/code-editor  # the code editor and diff — its own package, not part of tectra-ng
npm install @tectra-ng/qr      # QR codes without Angular or any other dependency; part of tectra-ng
npm install @tectra-ng/charts  # SVG charts without a chart library; part of tectra-ng
npm install @tectra-ng/utils   # pipes, directives, validators and helpers next to the components; part of tectra-ng
```

The rich text editor (`@tectra-ng/editor`) is installed on its own, also next to `tectra-ng`: it brings the ProseMirror engine with it, and apps without an editor should not carry it.

The code editor (`@tectra-ng/code-editor`) is installed on its own too: it brings the CodeMirror core (state and view). It edits HTML, CSS, JavaScript, TypeScript, JSON and Markdown with colours from the tokens, shows an inline or side by side diff, and `@tectra-ng/code-editor/highlight` renders highlighted code without the engine.

The charts (`@tectra-ng/charts`) are drawn as SVG by the components themselves — no chart library, no dependencies — render on the server and take their colours from the tokens. One entry point per chart: `@tectra-ng/charts/line`, `/column`, `/combo`, `/scatter`, `/pie`, `/radar`, `/radial-bar`, `/gauge`, `/funnel`, `/waterfall`, `/bullet`, `/candlestick`, `/boxplot`, `/range-area`, `/gantt`, `/sankey`, `/sunburst`, `/bar-list`, `/segmented-bar`, `/heatmap`, `/treemap`, `/rank-line`, `/org-chart`, and `/core` for your own charts (with SVG / PNG / CSV export). `tectra-ng` includes them.

The utilities (`@tectra-ng/utils`) are the pieces apps write again and again next to the components — date, relative time and file size pipes, debounced input, copy to clipboard, in-view and drag-scroll directives, form validators, filters kept in storage and the URL, HTTP params, retries and polling. One entry point per utility (`@tectra-ng/utils/date`, …), all safe for server rendering. `tectra-ng` includes them.

The QR code generator (`@tectra-ng/qr`) is plain TypeScript with no dependencies — it works in any framework, in Node and on the server. `tectra-ng` includes it; the `<tx-qr-code>` block in `@tectra-ng/blocks/qr-code` is built on it.

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

Working now: tokens, themes (light / dark, 17 primaries, 13 surfaces, 4 styles), core (config with unstyled + pass-through, overlay, forms, a11y, i18n, styles, ripple, fluid), icons, brand icons and flags, 75 ui entry points (forms, actions, data, overlays, display, feedback, layout, date and time — list in [packages/ui/README.md](packages/ui/README.md)), the docs site, unit tests, Playwright checks and CI.

Plan of what moves in next and in which order: [ROADMAP.md](ROADMAP.md).

## Layout

| Folder | What lives there | Published |
|---|---|---|
| `packages/tokens` | palettes (13 surfaces, 16 accents, severities), radius, typography, shadows — plain data | npm `@tectra-ng/tokens` |
| `packages/themes` | semantic light / dark, component design tokens, `createTectraPreset({ style, primary, surface })` with 4 themes, `definePreset` (deep merge) | npm `@tectra-ng/themes` |
| `packages/core` | behaviour without looks: config (theme, unstyled, pt), overlay, a11y, forms, i18n, styles, ripple, fluid, utils | npm `@tectra-ng/core/*` |
| `packages/icons` | 334 own outline icons + `<tx-icon>` + icon registry (`provideTxIcons`) | npm `@tectra-ng/icons` |
| `packages/brand-icons` | optional brand logos from Simple Icons (CC0) | npm `@tectra-ng/brand-icons` |
| `packages/flags` | optional country flags as SVG, rectangle and circle, loaded one by one | npm `@tectra-ng/flags` |
| `packages/ui` | components, one entry point each | npm `@tectra-ng/ui/<component>` |
| `packages/editor` | rich text editor on the ProseMirror core (`@tectra-ng/editor`) and the renderer for saved text (`@tectra-ng/editor/content`); install it separately | npm `@tectra-ng/editor` |
| `packages/code-editor` | code editor on the CodeMirror core (`@tectra-ng/code-editor`: editor, search, diff) and the static highlighter (`@tectra-ng/code-editor/highlight`); install it separately | npm `@tectra-ng/code-editor` |
| `packages/charts` | SVG charts without a chart library: line and area, column and bar, combo, scatter and bubble, pie and donut, radar, radial bar, gauge, funnel, waterfall, bullet, candlestick, box plot, range area, gantt, sankey, sunburst, bar list, segmented bar, heatmap, treemap, rank chart and org chart on one core (scales, axes, legend, tooltip, export, accessibility), one entry point each; part of `tectra-ng` | npm `@tectra-ng/charts/<chart>` |
| `packages/utils` | utilities next to the components: pipes, directives, validators, filter state, HTTP helpers, polling, clock; one entry point each; part of `tectra-ng` | npm `@tectra-ng/utils/<utility>` |
| `packages/qr` | QR codes without a framework: encoder (versions 1–40, levels L–H), SVG paths, styled SVG and PNG output; part of `tectra-ng` | npm `@tectra-ng/qr` |
| `packages/blocks` | ready page blocks built from the components: filters panel, page header, empty state, layouts … one entry point each; part of `tectra-ng` | npm `@tectra-ng/blocks/<block>` |
| `apps/docs` | the documentation site | Cloudflare Pages |
| `apps/sandbox` | local playground | — |
| `e2e/visual` | Playwright screenshots + axe | — |
| `tools` | Nx generators, docs extractors, AI docs | — |

## Dependency direction

```
tokens → themes → core → ui → editor, code-editor, charts, utils → blocks ← qr
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
