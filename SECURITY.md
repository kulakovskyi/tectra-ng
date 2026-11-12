# Security policy

## Supported versions

| Version | Supported |
|---|---|
| Latest minor release (`0.2.x` today) | Yes |
| Older versions | No — update to the latest release |

Security fixes go into the latest minor release of every `@tectra-ng/*` package and `tectra-ng`. A minor release is supported until the next minor release is published; from that day it is end of life and gets no further security updates. Each release's notes on [GitHub Releases](https://github.com/kulakovskyi/tectra-ng/releases) say which version it replaces.

## Reporting a vulnerability

Please do not open a public issue, discussion or pull request for a security problem.

Report it privately through GitHub: [**Report a vulnerability**](https://github.com/kulakovskyi/tectra-ng/security/advisories/new) (Security tab → Report a vulnerability). Only the maintainers listed in [GOVERNANCE.md](GOVERNANCE.md) see the report.

Include:

- the package and version (`@tectra-ng/ui/select 0.2.3`);
- what an attacker can do and under which conditions;
- steps or a small example that reproduces it.

## What happens next

- You get a first answer within **3 working days**.
- The report is confirmed or declined, with the reason, within **10 working days**.
- A confirmed vulnerability is fixed and released as soon as possible, and within **90 days** at the latest.
- After the fixed version is on npm, a GitHub security advisory is published in the [advisories list](https://github.com/kulakovskyi/tectra-ng/security/advisories), with credit to you unless you prefer to stay anonymous, and the fix is listed under the release notes. Please keep the details private until then (coordinated disclosure).

## Verifying a release

Releases are built and published only by the [`release` workflow](.github/workflows/release.yml) of `kulakovskyi/tectra-ng`, started from the `main` branch, through npm trusted publishing (OIDC). No long-lived npm token exists.

**npm packages.** Every published version carries npm provenance signed by GitHub Actions. Check the signatures and provenance of everything you installed:

```bash
npm audit signatures
```

The npm page of each version shows the provenance: it must name the repository `github.com/kulakovskyi/tectra-ng`, the workflow `.github/workflows/release.yml` and the commit of the release tag.

**GitHub release assets.** Every release on [GitHub Releases](https://github.com/kulakovskyi/tectra-ng/releases) carries the package tarballs (`tectra-ng-<package>-<version>.tgz`), a CycloneDX SBOM (`tectra-ng-<version>.cdx.json`) and a signed build provenance attestation (`tectra-ng-<version>.intoto.jsonl`). Verify an asset with the [GitHub CLI](https://cli.github.com):

```bash
gh attestation verify tectra-ng-ui-0.2.5.tgz --repo kulakovskyi/tectra-ng
```

A valid result names the signer workflow `kulakovskyi/tectra-ng/.github/workflows/release.yml` on `refs/heads/main`. Anything else — another repository, another workflow, or no attestation — means the file was not produced by the tectra release.

## Dependencies and static analysis

**Software composition analysis (dependencies).** Dependabot alerts, the dependency review on every pull request and the [VEX document](.vex/tectra-ng.openvex.json) cover the dependency tree.

| Finding | Threshold |
|---|---|
| New dependency with a known vulnerability of moderate or higher severity, or a known malicious package | Blocked in the pull request by the dependency review |
| Existing vulnerability of critical or high severity in a dependency of a published package | Fixed and released within 14 days |
| Existing vulnerability of moderate severity | Fixed within 30 days |
| Existing vulnerability of low severity | Fixed with the next routine update |
| Vulnerability in a dependency that does not affect the published packages | Recorded as `not_affected` with the reason in the VEX document and dismissed in Dependabot as tolerable risk |
| Dependency under a license that is not OSI-approved or not compatible with MIT | Removed or replaced before the next release |

**Before a release** there must be no open Dependabot alert of moderate or higher severity that affects a published package; anything that does not affect them is recorded in the VEX document first.

**Static analysis (SAST).** CodeQL analyses JavaScript, TypeScript and the GitHub Actions workflows on every pull request, every merge to `main` and weekly. Any CodeQL finding fails the required `ci-ok` check, so it blocks the merge. A finding that is proven not exploitable may be declared in `.github/codeql/codeql-config.yml` (a query filter with the reason in the pull request that adds it) — this is the only way to suppress one. Findings on `main` (for example from new CodeQL queries) are fixed within 14 days for critical and high severity and 30 days for the rest.

## Secrets and credentials

- **Storage.** Secrets live only in GitHub environment secrets: `docs` (Cloudflare API token and account id) and `npm` (none — publishing uses OIDC). Each environment can be used only by workflows running on `main`. Nothing secret is committed; GitHub secret scanning and push protection are on.
- **Access.** Only the maintainers in [GOVERNANCE.md](GOVERNANCE.md) can read or change environment secrets, the npm packages and the Cloudflare account, all behind two-factor authentication. Pull requests run without secrets and with a read-only token.
- **Scope.** Every token has the narrowest scope that works: the Cloudflare token is created with only the permissions needed to deploy the docs site; workflow tokens default to read-only and each job asks for the permissions it needs.
- **Rotation.** The Cloudflare token is rotated at least once a year, and immediately when a maintainer leaves, when it may have been exposed, or when a workflow that uses it changes owner. A leaked secret is revoked first, then replaced, then the incident is reviewed.
