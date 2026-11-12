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
- [x] e2e (`npm run e2e:ng-add`, CI job `ng-add`): `ng new` → `ng add` from the packed packages → second run → `ng build`; Playwright checks the files, the preset colour on a button, the fonts, a select in an overlay, axe and the console
- [x] Docs: "One command" on Getting started, root README quick start, `packages/tectra-ng/README.md`

## 14.2 Open in StackBlitz ✅

- [x] A bolt button ("Open in StackBlitz") next to Copy and Show code on every docs example; it posts the project to StackBlitz in a new tab, nothing to install
- [x] The project is a plain Angular CLI app (`node` template, `npm start` = `ng serve`): the example file as it is in the docs, `app.ts` that renders it, `app.config.ts` with the providers the docs give every example (router, brand logos, flags) and the theme picked on the site (style, primary, surface, dark mode, ripple), fonts in `index.html`
- [x] Versions from the workspace: `tectra-ng` at the docs version, `@tectra-ng/editor` / `@tectra-ng/code-editor` added when the example imports them, Angular, RxJS and TypeScript of the root `package.json` (written to `generated/stackblitz.ts` by the registry builder)
- [x] The `.flex`, `.stack`, `.hint`, `.reveal` classes of the examples live in `apps/docs/src/_example-utilities.scss`, used by the site and sent to StackBlitz from the same file; the gallery images an example shows go along in `public/`
- [x] e2e of the docs (`stackblitz.spec.ts`): the payload (files, example source, versions, theme, images, editor package), keyboard and label, no request reaches stackblitz.com
- [x] e2e on a new Angular app (`e2e/ng-add/stackblitz.spec.ts`, CI job `ng-add`): the projects of seven examples (button, carousel images, editor, code diff, router links, HTTP helpers, country flags) build with `ng build` on the packed packages and run without console errors
- Known: StackBlitz installs the released npm version, so an example merged after the last release can use an API that is published only with the next one

## 14.3 Bundle size check ⬜

- [ ] Found while building 14.1: a new app with one button and one select builds to 740 kB of initial JavaScript and passes the default 500 kB budget of the Angular CLI — find what `provideTectra` or the two components pull in

## 14.4 Test coverage 95% ⬜

## 14.5 Link check ⬜

## 14.6 Best Practices silver ⬜
