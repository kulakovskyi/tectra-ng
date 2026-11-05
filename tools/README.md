# tools — only for development (never published)

| Folder | What it does |
|---|---|
| `registry-builder/build-registry.mjs` | scans `apps/docs/src/content/components/*`, reads each component's `packages/ui/<name>` README + sources, writes `apps/docs/src/generated/registry.ts` (sidebar, routes, API, tokens, keyboard, examples with highlighted code). Runs before every docs build / serve |
| `generators/component` | (planned) `nx g tools:component select` → package folder + docs content + visual test |
| `ai` | (planned) Claude skill / MCP docs from the same data |
