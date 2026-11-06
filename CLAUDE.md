# tectra — instructions for Claude

tectra is an open-source Angular UI kit: full-featured components (the feature set of the big Angular kits), its own design tokens, themes and icons, and a docs site. Packages `@tectra-ng/*`, selector prefix `tx-`, CSS variables `--tx-*`.

## Product rules (hard)

- **tectra is a standalone product.** Never mention the apps that use it, their names, their wrappers or company internals — not in code, examples, READMEs, docs, ROADMAP, checklists or commit messages. When usage data matters, say "the first consumer app".
- Do not name other UI kits in product copy (docs site, READMEs). The internal roadmap may keep a "PrimeNG equivalent" column; the icon set keeps PrimeIcons-compatible names.
- Docs, READMEs, roadmap and code are English.
- Commit only when the user asks; commit messages have **no** `Co-Authored-By` trailer. Conventional commits (`feat(ui): …`, `fix(docs): …`).
- Work in roadmap order: [ROADMAP.md](ROADMAP.md) → the stage checklist (`roadmap/stage-3-forms.md`, …). Tick a box only when the code, the docs example and the test exist.

## Workspace

Nx 23 + Angular 22 (zoneless, standalone, signals, OnPush), TypeScript 6, ng-packagr secondary entry points, Vitest unit tests, Playwright e2e, npm.

```
packages/
  tokens/       @tectra-ng/tokens        primitives + palettes (ink, accents, severities), radius, type, shadows, motion, layers
  themes/       @tectra-ng/themes        semantic light/dark tokens, component tokens, presets (createInkPreset), definePreset, presetToCss, toStyleObject
  core/<entry>  @tectra-ng/core/<entry>  config (provideTectra, dt/pt/unstyled), overlay, a11y, forms, i18n, styles, ripple, fluid, utils
  icons/        @tectra-ng/icons         own SVG icon set (PrimeIcons names) + TxIcon, provideTxIcons
  brand-icons/  @tectra-ng/brand-icons   brand logos (Simple Icons, CC0)
  ui/<name>     @tectra-ng/ui/<name>     components, one flat entry point per component
  ui/styles/    shared SCSS mixins (_form-field.scss)
  blocks/<name> @tectra-ng/blocks/<name> composed blocks
apps/docs       docs site (port 4300), content in apps/docs/src/content/components/<name>
apps/sandbox    playground (port 4301)
e2e/visual      Playwright checks of the built docs (port 4310)
tools/          registry-builder (docs registry), icons, serve-docs
```

Aliases are wildcards in `tsconfig.base.json` (`@tectra-ng/ui/*` → `./packages/ui/*/index.ts`) — a new entry point needs no alias. Module boundaries (`eslint.config.mjs`, tags `pkg:*`): tokens → nothing; themes → tokens; core → themes, tokens; ui → core, icons, themes, tokens; blocks → ui + below. A ui entry point may import another ui entry point through its alias.

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
- e2e geometry: the scrollbar takes ~10px of the window in CI (Linux) and on Windows, 0px on macOS. Compare positions with `layoutViewport(page)` from `e2e/visual/helpers.ts`, not `page.viewportSize()` / `innerWidth` (ESLint blocks them). Details in the `verify` skill.

## Skills (load before the matching task)

| Task | Skill |
|---|---|
| New component / directive, or a new feature of one | `new-component` |
| Design tokens, presets, theming, CSS variables | `design-tokens` |
| Docs page, examples, README tables | `docs-examples` |
| Checking work before saying it is done | `verify` |
