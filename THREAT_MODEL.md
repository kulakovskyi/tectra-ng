# Threat model and security assessment

What could go wrong with tectra, where an attacker could come in and how each risk is handled. Reviewed with every release that changes the architecture in [ARCHITECTURE.md](ARCHITECTURE.md), and at least once a year. Last review: 2026-11-12.

## Assets

1. **Applications built with tectra** and their end users — the main asset: a flaw in a component runs inside someone else's app.
2. **The npm packages** — whoever can publish `tectra-ng` or `@tectra-ng/*` can ship code into every app that updates.
3. **The repository, CI and release workflow** — the path to the packages.
4. **The docs site and the domain** — users copy code and install commands from it.

## Attack surface

| Entry point | Who controls it | Critical code |
|---|---|---|
| Component inputs bound to end-user data (text, labels, options, table rows, tags, mentions) | End users of an app | Angular templates (escaped), `highlight-text`, `truncate-text`, chips and mention parsing |
| Rich text HTML loaded into the editor or rendered by `tx-editor-content` | End users, stored content | `sanitizeEditorHtml`, the editor schema's `parseDOM`, `toVideoEmbed`, link and image URL checks |
| Pasted content (clipboard), dropped and uploaded files, images | End users | Editor paste handling, file upload, avatar editor, image `FileReader` |
| URLs passed to components (links, images, QR logo, upload endpoint) | App developer, sometimes end users | Link component, QR PNG image inlining, file upload `HttpClient` call |
| Regular expressions over user text (search, highlighting, input masks, key filter, tokenizers) | End users | `highlight-text`, `input-mask`, `key-filter`, code tokenizers |
| Remembered state in `localStorage` / `sessionStorage` | Anyone with access to the browser profile | Table, splitter, filters, pinned tabs, layout, editor drafts |
| Server rendering in Node | App developer | Every component (no browser globals, no DOM parsing on the server) |
| Pull requests and their workflow runs | Anyone on GitHub | `ci.yml`, `pr-title.yml` |
| Release workflow inputs | Maintainer | `release.yml`, `tools/release.mjs` |
| Dependencies and GitHub Actions | Third parties | `package-lock.json`, pinned action SHAs |
| npm account, Cloudflare account, GitHub account | Maintainer | 2FA, OIDC publishing, environment secrets |

## Threats and mitigations (STRIDE)

| Threat | Example | Mitigation | Residual risk |
|---|---|---|---|
| **Tampering / elevation — XSS through rich text** | Stored HTML with `<script>`, `onerror=`, `javascript:` links or an `<iframe>` to an attacker | Allow-list sanitizer (tags, attributes, styles, classes), links limited to `http(s)`, `mailto`, `tel`, `sms`, relative; images to `http(s)`, raster `data:` and `blob:`; frames to HTTPS; video URLs rewritten to YouTube / Vimeo players; property tests on `toVideoEmbed`; CodeQL | An app that bypasses the renderer and binds raw HTML itself |
| **XSS through other inputs** | A label or option text containing markup | Angular template escaping; no `innerHTML` outside the editor and its sanitized renderer; no `eval` or `new Function` | — |
| **Denial of service — ReDoS** | A crafted string that makes a regex backtrack for seconds | User text is escaped before it becomes part of a pattern; patterns in masks, validators and password rules come from the app developer; the code editor's regex search runs the user's own pattern only in their own browser; CodeQL ReDoS queries; property tests on tokenizers and diff | Very large inputs remain the app's responsibility |
| **Denial of service — huge input** | A 10 MB paste into the code editor, a 100 000-row table | Virtual scrolling, character diff limits, QR capacity errors | Apps should limit input size |
| **Information disclosure — storage** | Remembered filters or an editor draft read by someone using the same browser | Storage only when the app opts in with a key; nothing is stored by default | Apps must not opt in for sensitive data on shared devices |
| **Spoofing / tampering — supply chain: malicious package version** | A stolen npm token publishes a backdoored release | No npm token exists: OIDC trusted publishing from the `release` workflow only; npm provenance; signed attestation of every release asset; 2FA on all maintainer accounts | Compromise of the maintainer's GitHub account with 2FA |
| **Tampering — malicious dependency** | A compromised transitive dependency | Minimal runtime dependencies; lockfile with integrity hashes; dependency review blocks known-vulnerable and malicious packages; Dependabot; pinned action SHAs | Zero-day malicious release of a dependency before advisories exist |
| **Elevation — CI injection** | A pull request title or branch name injected into a shell step; a fork PR stealing secrets | Untrusted values passed only through environment variables; release inputs validated; pull requests run with a read-only token and no secrets; secrets only in environments limited to `main`; OpenSSF Scorecard Dangerous-Workflow check | — |
| **Tampering — unreviewed change on `main`** | A direct push that skips CI | Ruleset: no direct pushes, force pushes or deletion; required `ci-ok` check; release tags cannot be moved or deleted | A single maintainer approves their own pull requests (no second reviewer yet) |
| **Spoofing — docs site** | Install commands changed to a typosquatted package | Docs deployed only from `main` by CI with an environment-scoped token; HTTPS only | Compromise of the Cloudflare account |
| **Repudiation** | Unclear who made a change | Signed-off commits (DCO), public history, pull requests, attestations naming the workflow run | — |

## Most likely and most impactful problems

1. **XSS through stored rich text** — most likely, high impact. Covered by the sanitizer and its tests; any change to the editor schema, sanitizer or renderer needs a test with hostile HTML.
2. **Supply-chain compromise of a release** — unlikely, highest impact. Covered by OIDC publishing, provenance, attestations, protected `main` and tags.
3. **ReDoS or runaway work on large input** — moderate likelihood, low to moderate impact. Covered by CodeQL, property tests and size limits.

Findings from this assessment are tracked as issues or as [security advisories](https://github.com/kulakovskyi/tectra-ng/security/advisories), with the timelines in [SECURITY.md](SECURITY.md).
