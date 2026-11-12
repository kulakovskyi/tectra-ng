# Architecture

How tectra is built, who acts on it and which interfaces the released packages expose. Security analysis: [THREAT_MODEL.md](THREAT_MODEL.md).

## What is released

tectra ships Angular libraries to npm. They run inside the application that installs them — in the browser and, with server rendering, in Node. tectra runs no servers of its own and collects no data; the docs site [tectra-ng.com](https://tectra-ng.com) is a static, prerendered site.

| Package | Role | Depends on |
|---|---|---|
| `@tectra-ng/tokens` | Design tokens as plain data | — |
| `@tectra-ng/themes` | Light and dark semantic tokens, presets, component tokens | tokens |
| `@tectra-ng/core` | Config (`provideTectra`), overlay, a11y, forms, i18n, styles, ripple | themes, tokens, `@angular/cdk` |
| `@tectra-ng/icons`, `brand-icons`, `flags` | SVG icon sets and flags | — |
| `@tectra-ng/ui` | Components, one entry point each | core, icons, themes, tokens |
| `@tectra-ng/charts`, `utils` | SVG charts; pipes, directives, validators, helpers | ui and below |
| `@tectra-ng/editor` | Rich text editor and HTML renderer | ui and below, ProseMirror core |
| `@tectra-ng/code-editor` | Code editor, diff, highlighter | ui and below, CodeMirror core |
| `@tectra-ng/qr` | QR encoder, SVG and PNG output, framework-free | — |
| `@tectra-ng/blocks` | Page blocks composed from the above | utils, code-editor, ui and below, qr |
| `tectra-ng` | Meta package that installs the kit at one version | all except the editors |

The dependency direction is enforced by ESLint module boundaries: a package never imports anything above it, packages never import apps.

## Actors and actions

```
contributor ──pull request──▶ GitHub ──▶ ci workflow ──ci-ok──▶ squash merge into main
                                              │
maintainer ──run workflow──▶ release workflow ┼──▶ npm (OIDC, provenance) ──▶ application developers
                                              ├──▶ tag + GitHub release (tarballs, SBOM, attestation)
                                              └──▶ version pull request ──▶ main
main ──▶ ci workflow ──ci-ok──▶ deploy-docs ──▶ Cloudflare ──▶ tectra-ng.com ──▶ visitors
Dependabot ──pull request──▶ ci workflow ──▶ auto-merge after ci-ok
```

| Actor | Actions | Trust |
|---|---|---|
| Contributor | Opens issues, discussions, pull requests from forks or branches | Untrusted input; runs no code with secrets |
| Maintainer | Reviews and merges pull requests, starts releases, manages settings and secrets ([GOVERNANCE.md](GOVERNANCE.md)) | Trusted, 2FA |
| `ci` workflow | Lint, unit tests, package and docs build, e2e, CodeQL, dependency review, sign-off check; deploys the docs from `main` | Read-only token on pull requests; Cloudflare token only on `main` in the `docs` environment |
| `release` workflow | Versions, builds, publishes to npm, tags, attests and attaches assets, opens the version pull request through the release GitHub App with auto-merge | Runs only from `main` in the `npm` environment; OIDC publishing, no stored npm token |
| `tectra-ng-release` GitHub App | Opens the version pull request so that CI runs on it, and merges it when `ci-ok` passes | Short-lived token for one run, contents and pull requests only |
| Dependabot | Opens dependency update pull requests weekly and on advisories | Same checks as any pull request |
| npm registry | Serves the packages with provenance | External |
| Cloudflare | Hosts the docs site and the `tectra-ng.com` domain | External |
| Application developer | Installs the packages and builds their app with them | Consumer of the API below |
| End user of an application | Interacts with tectra components inside that app | Their input reaches the components as data |

## External interfaces of the released packages

- **Angular API.** Components, directives, pipes and services with signal inputs, outputs and models, documented per component on [tectra-ng.com](https://tectra-ng.com) (API tab: inputs, outputs, slots, methods, keyboard).
- **Configuration.** `provideTectra()` (preset, mode, `dt`, `pt`, `unstyled`, locale), `provideTxIcons()`, `provideTxBrandIcons()`, injection tokens of each entry point.
- **Forms.** Value components implement `ControlValueAccessor` for reactive, template-driven and signal forms.
- **Styling.** CSS custom properties `--tx-*`, `tx-*` classes, `data-*` attributes; per-instance `dt` tokens and `pt` pass-through classes.
- **Plain functions.** `@tectra-ng/qr` (`encodeQr`, `qrToSvg`, `qrToPng`), editor HTML helpers (`sanitizeEditorHtml`), chart scales and formatters, utility functions.
- **Browser APIs used.** Clipboard (copy actions), `localStorage` / `sessionStorage` (only when an app passes a state or draft key: table, splitter, filters, pinned tabs, layout, editor drafts), `FileReader` and canvas (images in the editor, PNG export of QR codes and charts), `fetch` only to inline an image URL the app passes to a QR code, Angular `HttpClient` only in file upload, to the URL the app configures. No component calls a remote service on its own.
- **Output written to the DOM.** Angular templates (escaped by default); the editor renderer writes HTML only after `sanitizeEditorHtml` removes scripts, event handlers and unsafe URLs; video embeds are rewritten to YouTube and Vimeo player URLs or HTTPS links.

## Build and release

Nx builds every package with ng-packagr (`npm run build:packages`). The release workflow resolves the next version from conventional commits since the last tag, publishes to npm, commits the version bump on `release/vX.Y.Z`, tags it, attaches tarballs, a CycloneDX SBOM and a signed provenance attestation to the GitHub release, then opens the version bump as a pull request from the release GitHub App, which merges itself into `main` once CI passes. Details and verification: [SECURITY.md](SECURITY.md#verifying-a-release).
