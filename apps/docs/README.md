# docs — the tectra site

```bash
npx nx serve docs      # http://localhost:4300
npx nx build docs      # dist/apps/docs — static files
```

Imports the packages from source (`tsconfig.base.json` paths), not from npm — edit a component and the site reloads.

- `src/app/layout/` — header with the theme switch, sidebar built from the registry
- `src/app/pages/` — home, installation, theming + ONE `component-doc` page used by every component (tabs Features / API / Theming / Accessibility)
- `src/app/doc-ui/` — building blocks of the site: `example-frame` (live demo + "Show code"), `doc-table`
- `src/content/components/<name>/` — the ONLY thing written by hand per component: `overview.md` (front matter `category`, `examples` order) + `examples/<id>.example.ts` (+ optional `<id>.md` description)
- `src/generated/` — written by `tools/registry-builder` before every build / serve, not in git: `registry.ts` (small index for the navigation, loaded at start) and `components/<name>.ts` (one lazy chunk per component page)

Adding `src/content/components/<name>/` (and `packages/ui/<name>/`) is enough for the component to appear in the sidebar and get its page.
