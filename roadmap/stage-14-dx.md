# Stage 14 — developer experience, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs and the test for it exist.

**Every item also needs** (not repeated below): a check in CI so the promise stays kept, docs where users look for it, lint clean.

---

## 14.1 `ng add tectra-ng` ✅

- [x] Schematic collection in the meta package (`packages/tectra-ng/schematics`, `"schematics"` + `"ng-add": { "save": "dependencies" }` in its `package.json`), compiled to CommonJS by the `build` target
- [x] Options `--style`, `--primary`, `--surface` (the enums match `TECTRA_STYLES`, `PRIMARY_ORDER`, `SURFACE_PALETTES` — checked by a unit test), prompts for style and primary colour, `--fonts=false`, `--skip-install`, `--project`
- [x] Adds the missing Angular peers (`@angular/cdk`, `@angular/forms`, `@angular/router`) at the Angular version of the app; stops with a clear message below Angular 22 or without `@angular/core`
- [x] `provideTectra({ preset: createTectraPreset({ … }) })` through the Angular CLI root provider helper — standalone `app.config.ts` and NgModule apps
- [x] Onest and JetBrains Mono links in `index.html` (path from the build target), indented like the rest of `<head>`; a warning instead of a failure when `index.html` is missing or has no `</head>`
- [x] A second run changes nothing (existing `provideTectra` and fonts are kept)
- [x] Unit tests on a real Angular CLI workspace tree (Vitest, node), 95% coverage thresholds on the `test` target of `tectra-ng`
- [x] e2e (`npm run e2e:ng-add`, CI job `new-app`): `ng new` → `ng add` from the packed packages → second run → `ng build`; Playwright checks the files, the preset colour on a button, the fonts, a select in an overlay, axe and the console
- [x] Docs: "One command" on Getting started, root README quick start, `packages/tectra-ng/README.md`

## 14.2 Open in StackBlitz ✅

- [x] A bolt button ("Open in StackBlitz") next to Copy and Show code on every docs example; it posts the project to StackBlitz in a new tab, nothing to install
- [x] The project is a plain Angular CLI app (`node` template, `npm start` = `ng serve`): the example file as it is in the docs, `app.ts` that renders it, `app.config.ts` with the providers the docs give every example (router, brand logos, flags) and the theme picked on the site (style, primary, surface, dark mode, ripple), fonts in `index.html`
- [x] Versions from the workspace: `tectra-ng` at the docs version, `@tectra-ng/editor` / `@tectra-ng/code-editor` added when the example imports them, Angular, RxJS and TypeScript of the root `package.json` (written to `generated/stackblitz.ts` by the registry builder)
- [x] The `.flex`, `.stack`, `.hint`, `.reveal` classes of the examples live in `apps/docs/src/_example-utilities.scss`, used by the site and sent to StackBlitz from the same file; the gallery images an example shows go along in `public/`
- [x] e2e of the docs (`stackblitz.spec.ts`): the payload (files, example source, versions, theme, images, editor package), keyboard and label, no request reaches stackblitz.com
- [x] e2e on a new Angular app (`e2e/ng-add/stackblitz.spec.ts`, CI job `new-app`): the projects of seven examples (button, carousel images, editor, code diff, router links, HTTP helpers, country flags) build with `ng build` on the packed packages and run without console errors
- Known: StackBlitz installs the released npm version, so an example merged after the last release can use an API that is published only with the next one

## 14.3 Bundle size check ✅

- [x] `npm run size` (`tools/bundle-size`, no new dependency): a production `ng build` of a new Angular app per scenario on the packed packages — Angular alone for reference, `provideTectra` alone, then one component each (button, select, table, datepicker, dialog, line chart, rich text editor, code editor)
- [x] Measures the `@tectra-ng/*` JavaScript loaded at start (from the esbuild stats, following static imports from `main.ts`) and, apart, the kit code loaded later (the PDF font of the table export stays lazy)
- [x] Budgets in `tools/bundle-size/budgets.json` (measured + 2%) with the entry points each scenario pulls in; CI fails when a scenario grows past its budget or pulls in a new entry point, notes when it shrank; `npm run size:update` raises them on purpose
- [x] CI job `new-app` (with the `ng add` and StackBlitz checks), the table in the job summary; checked that a lowered budget and a removed entry point fail with a clear message

First measurement (2026-11-12, kit code at start, minified): `provideTectra` alone 157 kB, button 246 kB, select 346 kB, table 745 kB — an app with a button and a select passed the 500 kB warning budget of a new Angular CLI app. The base came from four places, now fixed (see "Smaller base bundle" below).

## Smaller base bundle ✅

What the kit adds to an empty Angular app at start (production build, minified / gzip):

| Scenario | Before | After |
|---|---|---|
| `provideTectra` alone | 159 kB / 33 kB | 15 kB / 6 kB |
| button | 276 kB / 62 kB | 90 kB / 24 kB |
| select | 494 kB / 120 kB | 257 kB / 74 kB |
| dialog | 428 kB / 99 kB | 193 kB / 53 kB |
| datepicker | 538 kB / 127 kB | 306 kB / 82 kB |
| table | 1086 kB / 266 kB | 769 kB / 196 kB, 458 kB more on first use |

- [x] Table: the date, number and options editors of the filters and cells are `@defer` blocks (lazy chunks); a read-only input of the same size holds their place, a cell editor that loads gets the focus
- [x] Locales: only English is in the bundle; Ukrainian is `@tectra-ng/core/i18n/ua`, loaded before the app starts when `provideTectra({ locale: 'ua' })` names it, or by `setLocale` (now a promise); `provideTectra({ locales })` for one that switches at once; translation types in `@tectra-ng/core/i18n/types`
- [x] Icons: one constant per icon; components bring the icons they draw (`<name>.icons.ts`, `provideTxIconDefaults`), apps register the rest with `provideTxIcons(TX_ICONS)` or chosen icons; e2e of a new app that registers no icon
- [x] Themes: `@tectra-ng/themes` is tree-shakable (no top-level side effects in token files); presets hold only the overrides of a style; a component registers the token groups it uses (`<name>.theme.ts`, `injectTokens`) and `TxThemeService` writes only those; `presetToCss` still writes everything; docs e2e fails on a `var(--tx-…)` that no rule declares (it also found a token pointing at a weight that does not exist)
- [x] Styles: `createTectraPreset({ style: softStyle })` takes the style object, so an app ships only its own style (the default preset with palettes is about 11 kB, Soft adds 4.5 kB); style files have no top-level side effects either; `TECTRA_STYLES[name]` for a choice at runtime
- [x] `UPGRADING.md`: the steps for an app on 0.2

## 14.4 Test coverage 95% ✅

- [x] Coverage always on in the `test` target of every package with tests (`coverage: true`; include the package's `.ts`, exclude specs, `index.ts`, test setup and `generated/` data — flag artwork, the PDF font), `@vitest/coverage-v8` as the only dev dependency; reports in `coverage/<package>` (text summary, `json-summary`, `lcov`), kept by the Nx cache
- [x] `coverageThresholds` 95% for statements, branches, functions and lines on every `test` target, so `npm run test` and CI fail when a package drops (checked: a raised threshold fails the run)
- [x] `npm run coverage:report` (`tools/coverage`, no dependency): the table of every package and all together, in the CI job summary of `Test · unit`; the `coverage` artifact; badge JSON published with the docs at `/badges/coverage.json`, the README badge reads it through shields.io
- [x] Every package raised to 95% (statements / branches before → after, 2026-11-12): editor 65 / 57 → 99 / 97, code-editor 86 / 73 → 99 / 98, charts 90 / 76 → 100 / 97, ui 89 / 81 → 99 / 98, blocks 92 / 80 → 99 / 96, core 91 / 86 → 100 / 99, utils 95 / 88 → 100 / 99, themes 99 / 95 → 100 / 100, qr 93 / 95 → 99 / 98, flags → 100; all packages together 88 / 79 → 99 / 98
- [x] Bugs the new specs found, fixed: Enter in the middle of a list item of the editor added a paragraph inside the item; `clear()` of the editor did not update the form value; a focus call after destroying the editor threw; the editor's suggestion list and selection bubble shared one scroll strategy (`/table` threw); a router link `target` was dropped on breadcrumb, panel menu, stat tile, console rail and app footer items; breadcrumb, panel menu, public header and cookie notice rendered router links without a router provided (`Router` is provided in root, the check is now `ActivatedRoute`); the sankey chart threw when the hovered link was removed
- [x] Specs share one jsdom: stubbed globals restored with `vi.unstubAllGlobals`, no rejected promise left pending

## 14.5 Link check ✅

- [x] `npm run links` (`tools/link-check`, no dependency): every link of the tracked Markdown files (READMEs, guides, roadmap; the docs content is checked as built pages) and of the 178 built docs pages — about 42 000 links
- [x] Offline part: relative paths and `#anchors` (GitHub heading slugs in Markdown, ids in HTML), `tectra-ng.com` links against the docs build (a new page is checked before it is deployed), `github.com/kulakovskyi/tectra-ng/blob|tree/main/…` links against the repository; runs in the CI job `Build · docs site` on every pull request (`--offline`, about a second)
- [x] Network part: every external address once (HEAD, then GET, three tries, eight hosts at a time); npm package pages through the registry, since npmjs.com refuses automated requests; 401 / 403 / 429 reported as not verified, not broken; placeholder hosts and `missing-*` assets skipped
- [x] Weekly workflow `links` (Monday, and on demand): builds the docs and checks everything, the table of broken links grouped by address in the job summary, a failed run notifies like any failed scheduled workflow
- [x] Tests: `npm run test:tools` (`node:test`, in the CI job `Test · unit`): link extraction from Markdown and HTML (code blocks and comments skipped), heading slugs, link kinds, the CLI failing on a broken page and anchor; checked on the repository with injected broken links (a missing file, a missing heading, a 404 repository, a missing npm package): all four reported
- First run (2026-11-12): no broken links, 158 external addresses


## 14.6 Best Practices silver ⬜
