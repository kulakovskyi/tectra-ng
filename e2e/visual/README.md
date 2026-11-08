# e2e/visual — Playwright checks of the docs site

```bash
npx nx e2e visual
```

Builds the docs, serves `dist/apps/docs/browser` on port 4310 (`tools/serve-docs.mjs`) and runs:

- `pages.spec.ts` — every page (home, installation, theming, icons, each component) in light and dark: no console errors, cumulative layout shift below 0.02, no serious / critical axe violations inside `main`. Pages are prerendered and then hydrated, so a shift here often means the server render differs from the browser one. An asset named `missing-*` (a broken image in an example) may 404 without failing the check
- `interactions.spec.ts` — select panel is opaque and works from the keyboard, example code opens without moving the preview, navigation keeps the heading in place, icon-only buttons are square, theme toggle

Set `TX_E2E_PORT` to serve on another port, for example when two checkouts run e2e at the same time:

```bash
TX_E2E_PORT=4320 npm run e2e
```

Locally it uses the installed Chrome (`channel: 'chrome'`); in CI the Playwright Chromium.
