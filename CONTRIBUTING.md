# Contributing

Thanks for helping. Questions go to [Discussions](https://github.com/kulakovskyi/tectra-ng/discussions) — see [SUPPORT.md](SUPPORT.md). Roles and how decisions are made: [GOVERNANCE.md](GOVERNANCE.md).

## How a change lands

Nobody pushes to `main`, maintainers included — a repository ruleset blocks it. Every change goes through a pull request:

1. Branch from the latest `main`, commit with `git commit --signoff`, push the branch and open a pull request.
2. CI runs on the pull request. The required check **`ci-ok`** passes only when lint, unit tests, the package build, the docs build, the build and unit tests on the lowest Angular, CDK and rxjs versions the packages accept, the e2e suite, the checks on a new Angular app built from the same packages (`ng add`, the StackBlitz projects of the docs examples and the bundle size budgets), CodeQL, the dependency review and the sign-off check all pass.
3. The pull request is squash-merged once `ci-ok` is green — the title becomes the commit on `main`.

The release workflow follows the same rule: it publishes from a tagged `release/vX.Y.Z` branch and merges the version bump through a pull request after CI passes.

## Requirements for acceptable contributions

1. Pick the next item in [ROADMAP.md](ROADMAP.md) and follow its definition of done.
2. Component in `packages/ui/<name>`, tokens in `packages/themes/src/components/<name>.tokens.ts`, README with Inputs / Outputs / Slots / Keyboard, docs content in `apps/docs/src/content/components/<name>`.
3. A `*.spec.ts` next to every component, directive and service. `npm run lint` must be clean, without warnings.
4. `npm run e2e` must stay green — no console errors, no layout shift, no serious axe violations in light and dark.
5. Bundle size stays within [`tools/bundle-size/budgets.json`](tools/bundle-size/budgets.json): CI builds a new Angular app per scenario (one component each) and fails when the kit code loaded at start grows past its budget or a scenario starts to pull in another entry point. When the growth is intended, run `npm run size:update` (after `npm run build:packages` and `npm run e2e:ng-add`) and say why in the pull request.
6. Links stay valid: the docs build job checks every link inside the repository and the docs site (relative paths, anchors, docs pages, `tectra-ng.com` and repository file links) — `npm run links -- --offline` after the docs build. The weekly `links` workflow also requests every external address; run `npm run links` for the same check locally.
7. The pull request title is a conventional commit (`feat(ui): …`, `fix(docs): …`) — it becomes the squash commit, and the release reads the next version and the changelog from it. CI checks it.
8. Every commit is signed off (see below).

## Coding standards

- **Angular:** the official [Angular style guide](https://angular.dev/style-guide) with signals — standalone components, signal `input()` / `output()` / `model()`, `inject()`, `OnPush`, no decorators for inputs and outputs, selector prefix `tx-`.
- **TypeScript:** `strict`, `strictTemplates`, no `any`; types of an entry point live in `<name>.types.ts`.
- **Styles:** design tokens through `var(--tx-…)` only, BEM classes `tx-<name>__part--state`, motion respects `prefers-reduced-motion`.
- **Formatting:** Prettier ([`.prettierrc.json`](.prettierrc.json): single quotes, width 100) and [`.editorconfig`](.editorconfig).
- **Enforcement:** ESLint ([`eslint.config.mjs`](eslint.config.mjs): typescript-eslint, angular-eslint including `prefer-signals` and `prefer-on-push-component-change-detection`, module boundaries between packages) runs in CI as part of `ci-ok`; it must report no errors and no warnings.

## Developer Certificate of Origin

By signing off a commit you state that you wrote it or have the right to submit it under the project's MIT license, as described in the [Developer Certificate of Origin 1.1](https://developercertificate.org/). Sign off with:

```bash
git commit --signoff -m "fix(ui): …"
```

This adds `Signed-off-by: Your Name <your@email>` with the same email as the commit author. CI rejects a pull request with a commit that has no matching sign-off. Bot commits (Dependabot) are exempt. Forgot it? `git rebase --signoff main` and force-push your branch.

## Tests: when and how they run

| When | What runs |
|---|---|
| Locally, before you push | `npm run lint`, `npm run test` (Vitest unit tests), `npm run e2e` (Playwright checks of the built docs site) — see [README → Development](README.md#development) |
| Every pull request | The full CI: lint, unit tests, package build, docs build, e2e in 8 shards (every docs page in light and dark, console errors, layout shift, axe), CodeQL, dependency review, sign-off check |
| Every merge to `main` | The same CI, then the docs site is deployed |
| Every release | Lint and unit tests again before anything is published, then CI on the version pull request |
| Weekly | CodeQL on `main`, OpenSSF Scorecard |

**Test policy:** every new feature and every bug fix adds or updates automated tests — a unit spec for the behaviour, an e2e check in `e2e/visual/interactions.spec.ts` for layout, motion or focus. Each package keeps at least 95% statement, branch, function and line coverage ([ROADMAP](ROADMAP.md), stage 14): coverage is always on in the `test` target of every package, its `coverageThresholds` fail `npm run test` and CI when a package drops, and `npm run coverage:report` prints the table of all packages (reports in `coverage/<package>`). New or changed code comes with the specs that keep its package there; never lower a threshold or exclude files to pass.

## Dependencies

- **Selection.** tectra keeps runtime dependencies to an irreducible core: Angular and its CDK as peers, the ProseMirror core in `@tectra-ng/editor` and the CodeMirror core in `@tectra-ng/code-editor`. Everything else — charts, QR codes, icons, utilities — is written in the kit. A new runtime dependency needs a maintainer's approval in the pull request, an OSI-approved license and active maintenance.
- **Obtaining.** Dependencies come only from the npm registry. `package-lock.json` pins the full tree with integrity hashes; CI and the release install with `npm ci`. GitHub Actions are pinned to commit SHAs.
- **Tracking.** Dependabot checks npm and GitHub Actions weekly and groups minor and patch updates into one pull request that merges after CI passes; security updates come as soon as an advisory is published. Major versions are upgraded by hand. The dependency review on every pull request blocks dependencies with known vulnerabilities of moderate or higher severity and known malicious packages. Policy and thresholds: [SECURITY.md](SECURITY.md#dependencies-and-static-analysis).
