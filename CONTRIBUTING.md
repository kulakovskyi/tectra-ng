# Contributing

1. Pick the next item in [ROADMAP.md](ROADMAP.md) and follow its definition of done.
2. Component in `packages/ui/<name>`, tokens in `packages/themes/src/components/<name>.tokens.ts`, README with Inputs / Outputs / Slots / Keyboard, docs content in `apps/docs/src/content/components/<name>`.
3. A `*.spec.ts` next to every component, directive and service: `npm run test`. `npm run lint` must be clean.
4. `npm run e2e` must stay green — no console errors, no layout shift, no serious axe violations in light and dark.
5. The pull request title is a conventional commit (`feat(ui): …`, `fix(docs): …`) — it becomes the squash commit, and the release reads the next version and the changelog from it. CI checks it.

Questions go to [Discussions](https://github.com/kulakovskyi/tectra-ng/discussions) — see [SUPPORT.md](SUPPORT.md).
