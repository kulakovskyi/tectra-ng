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

## 14.2 Open in StackBlitz ⬜

## 14.3 Bundle size check ⬜

- [ ] Found while building 14.1: a new app with one button and one select builds to 740 kB of initial JavaScript and passes the default 500 kB budget of the Angular CLI — find what `provideTectra` or the two components pull in

## 14.4 Test coverage 95% ⬜

## 14.5 Link check ⬜

## 14.6 Best Practices silver ⬜
