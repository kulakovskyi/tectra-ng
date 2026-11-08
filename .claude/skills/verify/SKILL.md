---
name: verify
description: Use before reporting tectra work as done — lint, unit tests, e2e (console errors, layout shift, axe in light and dark), package build, and a visual check of the changed docs pages with Playwright screenshots in both themes.
---

# Verify tectra work

Run from the repo root with `NX_DAEMON=false NX_NO_CLOUD=true`.

1. `npm run lint` — zero errors AND zero warnings.
2. `npm run test` — all Vitest suites (themes, core, icons, ui).
3. `npm run e2e` — builds the docs (registry first), serves `dist/apps/docs/browser` on 4310 (or `TX_E2E_PORT`), runs:
   - `pages.spec.ts`: every page in light and dark — no console errors, CLS < 0.02, no serious / critical axe violations;
   - `interactions.spec.ts`: behaviour tests. Add one for every bug fixed by layout / motion / focus.
   The docs build prerenders every route on the server. Read its log: it must say `Prerendered N static routes` and contain no `ERROR` lines — a component that throws on the server only logs there, the build still passes. For a readable stack run `npx nx run docs:build-app:development`.
   Stop a leftover server on your port first: `lsof -ti tcp:4310 | xargs kill`. Never `pkill -f serve-docs.mjs` — it also kills the servers of other checkouts (another worktree runs e2e with `TX_E2E_PORT=4320`).
4. Packages touched → `npm run build:packages` (ng-packagr catches entry point / export mistakes the app build hides).
5. Look at the result. Unit tests and axe do not see misaligned labels, clipped text or wrong colours:

```bash
node tools/serve-docs.mjs dist/apps/docs/browser 4310 &
```

A Playwright script (import from `node_modules/@playwright/test/index.mjs`, `chromium.launch({ channel: 'chrome' })`, viewport 1440×900, `reducedMotion: 'reduce'`) opens `/components/<name>`, screenshots each changed example (`page.locator('<name>-<id>-example').screenshot()`), then sets dark mode with `document.documentElement.setAttribute('data-tx-theme', 'dark')` and screenshots again. Read the images. For alignment bugs measure instead of guessing: `getBoundingClientRect()` of the parts and `getComputedStyle()` values. Keep scripts and images in the scratchpad, never in the repo. Stop the server afterwards by its port (`lsof -ti tcp:4310 | xargs kill`).

6. Check the checklist / ROADMAP ticks match what was built, and that no text mentions a consumer app or company (`grep -ri` for their names in the diff).

Report what ran and what passed; anything not checked is named as not checked.

## Gotchas

- e2e uses the installed Chrome locally (`channel: 'chrome'`), Playwright Chromium in CI.
- The scrollbar takes part of the window on Linux / Windows (~10px in CI, 0px on macOS where it overlays). A test that passes on the Mac can fail in CI by that gutter. Measure against `layoutViewport(page)` from `helpers.ts` (`documentElement.clientWidth / clientHeight`), never `page.viewportSize()` or `innerWidth` / `innerHeight` — ESLint blocks them in `e2e/`. Fixed panels end at the scrollbar, not at the window edge.
- Wait for the page content (`await expect(page.locator('docs-example-frame').first()).toBeVisible()`) before `mouse.wheel` — right after `goto` there is nothing to scroll yet in CI.
- Motion tests: start the frame watcher before the action that closes the panel, and assert one in-between frame, not a frame count — CI drops frames under load.
- `expect.poll` for values that change during CSS transitions; `getAnimations()` to wait for the end of an animation.
- Exact accessible names: `getByRole('button', { name: 'Copy', exact: true })`.
- jsdom has no `PointerEvent`, `matchMedia`, `scrollIntoView`, `ResizeObserver` — stub or guard in unit tests.
- Nx caches tasks: `npm run test` may report a cache hit when only SCSS or docs changed; that is expected. `npm run e2e` depends on the docs build, which reruns whenever docs, packages or content change.
