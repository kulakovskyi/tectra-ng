# tectra — instructions for Claude

tectra is an open-source Angular UI kit: full-featured components (the feature set of the big Angular kits), its own design tokens, themes and icons, and a docs site. Packages `@tectra-ng/*`, selector prefix `tx-`, CSS variables `--tx-*`.

## Product rules (hard)

- **tectra is a standalone product.** Never mention the apps that use it, their names, their wrappers or company internals — not in code, examples, READMEs, docs, ROADMAP, checklists or commit messages. When usage data matters, say "the first consumer app".
- Never name PrimeNG, PrimeIcons or any other UI kit — not in docs, examples, READMEs, code, test names or package metadata. Only the internal roadmap (`ROADMAP.md`, `roadmap/`) may keep the comparison. Icon names stay as they are (a `pi-` prefix is still accepted), just never say where they come from.
- Docs, READMEs, roadmap and code are English.
- Commit only when the user asks; commit messages have **no** `Co-Authored-By` trailer. Conventional commits (`feat(ui): …`, `fix(docs): …`).
- Work in roadmap order: [ROADMAP.md](ROADMAP.md) → the stage checklist (`roadmap/stage-3-forms.md`, …). Tick a box only when the code, the docs example and the test exist.

## Workspace

Nx 23 + Angular 22 (zoneless, standalone, signals, OnPush), TypeScript 6, ng-packagr secondary entry points, Vitest unit tests, Playwright e2e, npm.

```
packages/
  tokens/       @tectra-ng/tokens        primitives + palettes (ink, accents, severities), radius, type, shadows, motion, layers
  themes/       @tectra-ng/themes        semantic light/dark tokens, component tokens, presets (createTectraPreset: style + primary + surface; styles in src/styles/<name>), definePreset, presetToCss, toStyleObject
  core/<entry>  @tectra-ng/core/<entry>  config (provideTectra, dt/pt/unstyled), overlay, a11y, forms, i18n, styles, ripple, fluid, utils
  icons/        @tectra-ng/icons         own SVG icon set + TxIcon, provideTxIcons
  brand-icons/  @tectra-ng/brand-icons   brand logos (Simple Icons, CC0)
  flags/        @tectra-ng/flags         country flags (generated from flag-icons, MIT), lazy chunks; `npm run flags`
  ui/<name>     @tectra-ng/ui/<name>     components, one flat entry point per component
  ui/export-font @tectra-ng/ui/export-font Onest (OFL) for PDF export, loaded on the first PDF export; `npm run export-font`
  ui/styles/    shared SCSS mixins (_form-field.scss)
  editor/       @tectra-ng/editor        rich text editor on the ProseMirror core: model, state, view, transform (own package, engine deps stay out of ui; everything above the core is our code); editor/content = renderer + HTML helpers
  qr/           @tectra-ng/qr            QR codes without a framework: encoder, SVG paths, styled SVG / PNG (no dependencies; blocks/qr-code is the Angular block on it)
  blocks/<name> @tectra-ng/blocks/<name> composed blocks
apps/docs       docs site (port 4300), content in apps/docs/src/content/components/<name>; every route prerendered (SSG + hydration), so docs code must run on the server (no bare window / requestAnimationFrame); SEO meta per page in src/app/seo + data/seo.data.ts
apps/sandbox    playground (port 4301)
e2e/visual      Playwright checks of the built docs (port 4310)
tools/          registry-builder (docs registry), site-files (sitemap, robots, llms.txt, component .md, 404 after the docs build), brand (favicons, social preview), icons, flags, export-font, serve-docs
```

Aliases are wildcards in `tsconfig.base.json` (`@tectra-ng/ui/*` → `./packages/ui/*/index.ts`) — a new entry point needs no alias. Module boundaries (`eslint.config.mjs`, tags `pkg:*`): tokens → nothing; themes → tokens; core → themes, tokens; ui → core, icons, themes, tokens; qr → nothing; editor → ui + below; blocks → ui + below and qr. A ui entry point may import another ui entry point through its alias.

## New npm package (checklist)

A new package under `packages/` (like `editor`) is not done until all of these are in place — users and the release must find it:

- **Workspace:** `project.json` (`build`, `test`, tag `pkg:<name>`), `package.json` (peers on `@tectra-ng/*`, real dependencies only for an engine that cannot live in the kit, `publishConfig.access: public`), `ng-package.json` (`allowedNonPeerDependencies` for those), paths in `tsconfig.base.json`, module boundary in `eslint.config.mjs`, `build:packages` and `test` scripts in `package.json`, `release.projects` in `nx.json`.
- **Install docs — say how to get it, everywhere people look:** the Install block and the Layout table of the root `README.md`; `packages/tectra-ng/README.md` (and its `dependencies` if the meta package includes it — say so explicitly when it does not); the install line at the top of the package README; an entry in `INSTALL_PACKAGES` of `apps/docs/src/app/data/install.data.ts` (and an extra in `INSTALL_EXTRAS` when it needs setup); the docs `overview.md` of its pages (`source:` / `package:` front matter); the `Workspace` tree and boundaries in this file.
- **First npm publish is manual:** the `release` workflow publishes through npm Trusted Publishing, which is set per package and only for a package that exists. Before the first release the user publishes a placeholder (`0.0.1`, name only) with their npm login, then adds the trusted publisher on npmjs.com → package → Settings → Trusted Publisher → GitHub Actions (`kulakovskyi` / `tectra-ng` / `release.yml` / environment `npm`). Tell the user this when a package is added; never publish for them.

## Commands

Prefix Nx commands with `NX_DAEMON=false NX_NO_CLOUD=true`.

| Task | Command |
|---|---|
| Lint (must be clean, also warnings) | `npm run lint` |
| Unit tests | `npm run test` |
| e2e (builds docs, serves on 4310, `TX_E2E_PORT` to change) | `npm run e2e` |
| Build all packages | `npm run build:packages` |
| Docs dev server (4300) | `npm run docs` |
| Regenerate docs registry | `npm run registry` |
| Format docs examples | `npm run format:examples` |
| Rebuild icons | `npm run icons` |
| Rebuild flags | `npm run flags` |
| Rebuild favicons and the social preview (`tools/brand/social-preview.html`) | `npm run brand` |
| Rebuild the PDF export font | `npm run export-font -- <folder of an Onest release>` |
| Retake the landing product shots (dev-only `/studio/:scene` page, own dev server on 4302) | `npm run landing-shots` |
| Release (npm) | GitHub Actions → `release` → Run workflow; dry run locally: `node tools/release.mjs patch latest --dry-run` |

Install packages with `npm i … --legacy-peer-deps` (npm arborist bug otherwise). Do not start or stop the user's dev servers; start your own `node tools/serve-docs.mjs dist/apps/docs/browser 4310` for checks and stop it afterwards.

## Code conventions

- Signal APIs only: `readonly x = input<T>()`, `output()`, `model()`, `computed()`, `signal()`; `inject()` in fields, `private` unless the template needs it. No decorators `@Input` / `@Output` / `@HostBinding`.
- `host: {}` metadata for classes and attributes: base class `tx-<name>`, BEM modifiers `tx-<name>--<state>`, `data-size` / `data-variant` attributes, `data-styled` when not unstyled.
- Boolean inputs that inherit from somewhere (form control, `<tx-fluid>`, global config) use `input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean })`; plain ones use `booleanAttribute`.
- Every themable component has `dt`, `pt`, `ptOptions`, `unstyled` (skill `new-component`).
- No comments in code or SCSS — names explain. No `any`.
- Types in `<name>.types.ts`, one public barrel per entry point: `packages/ui/<name>/index.ts`.
- Styles: tokens through `var(--tx-…)` only — no hard-coded colours, sizes come from tokens. Motion respects `prefers-reduced-motion`.
- Accessibility is part of done: keyboard map in the README, ARIA roles/states, axe clean in light and dark.
- Server rendering: every component renders on the server exactly as in the browser — the docs pages are prerendered and hydrated, and apps may use SSR. No `window`, `document`, `DOMParser`, `requestAnimationFrame` or `ResizeObserver` outside the browser: take `DOCUMENT`, put browser-only work in `afterNextRender`. Anything that changes the first paint (classes, insets, label checks) is decided from inputs or in `ngAfterViewInit`, not only after `afterNextRender`, or the page jumps after hydration. The server DOM has no `append` / `replaceWith` / `replaceChildren`: use `appendChild` / `insertBefore` / `replaceChild`.
- e2e: import `test` / `expect` from `e2e/visual/fixtures.ts` — `goto` and `reload` wait for hydration. An asset named `missing-*` (a broken image on purpose) may 404 without failing the console check.
- e2e geometry: the scrollbar takes ~10px of the window in CI (Linux) and on Windows, 0px on macOS. Compare positions with `layoutViewport(page)` from `e2e/visual/helpers.ts`, not `page.viewportSize()` / `innerWidth` (ESLint blocks them). Details in the `verify` skill.

## Skills (load before the matching task)

| Task | Skill |
|---|---|
| New component / directive, or a new feature of one | `new-component` |
| Design tokens, presets, theming, CSS variables | `design-tokens` |
| Docs page, examples, README tables | `docs-examples` |
| Checking work before saying it is done | `verify` |
