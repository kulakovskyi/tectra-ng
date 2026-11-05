# e2e/visual — Playwright checks of the docs site

```bash
npx nx e2e visual
```

Builds the docs, serves `dist/apps/docs/browser` on port 4310 (`tools/serve-docs.mjs`) and runs:

- `pages.spec.ts` — every page (home, installation, theming, icons, each component) in light and dark: no console errors, cumulative layout shift below 0.02, no serious / critical axe violations inside `main`
- `interactions.spec.ts` — select panel is opaque and works from the keyboard, example code opens without moving the preview, navigation keeps the heading in place, icon-only buttons are square, theme toggle

Locally it uses the installed Chrome (`channel: 'chrome'`); in CI the Playwright Chromium.
