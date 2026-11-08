# tools — only for development (never published)

| Folder | What it does |
|---|---|
| `registry-builder/build-registry.mjs` | scans `apps/docs/src/content/components/*`, reads each component's `packages/ui/<name>` README + sources and the preset tokens, writes `apps/docs/src/generated/registry.ts` (navigation index, loaded at start) and `generated/components/<name>.ts` (one lazy chunk per page). Runs before every docs build / serve |
| `icons/build-icons.mjs` | builds `packages/icons/src/icons.ts` from `icons/defs/*.mjs` (shapes on a 24 grid via `icons/geometry.mjs`); checks every listed icon name is drawn. `ICON_SHEET_DIR=<dir> node tools/icons/build-icons.mjs [all|prefix|a,b,c]` also writes contact-sheet SVGs to review |
| `generators/component` | (planned) `nx g tools:component select` → package folder + docs content + visual test |
| `ai` | (planned) Claude skill / MCP docs from the same data |
