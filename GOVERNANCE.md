# Governance

tectra is an open-source project under the MIT license. This document says who runs it, who can reach its sensitive resources and how that changes.

## Members with access to sensitive resources

| Member | Role | Access |
|---|---|---|
| [@kulakovskyi](https://github.com/kulakovskyi) | Maintainer, owner | GitHub repository admin (settings, rulesets, environments and their secrets, security advisories), npm owner of `tectra-ng` and every `@tectra-ng/*` package, Cloudflare account with the `tectra-ng.com` domain and the docs site |

Automation with access:

| Actor | Access |
|---|---|
| `release` workflow | Publishes to npm through trusted publishing (OIDC, no stored token), creates tags and GitHub releases; runs only from `main` in the `npm` environment |
| `tectra-ng-release` GitHub App | Opens the version pull request of a release and turns on its auto-merge; installed only on this repository with contents and pull-request access, used only by the release workflow |
| `ci` workflow, `deploy-docs` job | Deploys the docs site with the Cloudflare token of the `docs` environment; runs only on `main` |
| Dependabot | Opens dependency pull requests; they merge only after CI passes |

Every human account listed here must use two-factor authentication on GitHub, npm and Cloudflare.

## Roles and responsibilities

**Maintainer**
- Sets the direction in [ROADMAP.md](ROADMAP.md) and decides what is merged.
- Reviews pull requests, keeps CI green and merges through the protected `main` branch like everyone else.
- Runs releases and keeps the release workflow, npm packages, domain and docs deployment working.
- Handles vulnerability reports within the times in [SECURITY.md](SECURITY.md) and publishes advisories.
- Manages access and secrets as described below and in [SECURITY.md](SECURITY.md#secrets-and-credentials).

**Contributor** — anyone who opens an issue, a discussion or a pull request.
- Follows [CONTRIBUTING.md](CONTRIBUTING.md): conventional pull request titles, signed-off commits, tests and docs with every change.
- Follows the [code of conduct](CODE_OF_CONDUCT.md).

**Security reporter** — reports privately as described in [SECURITY.md](SECURITY.md) and keeps the details private until the advisory is published.

## Decisions

Decisions are made in public: in issues, discussions and pull requests. The maintainer has the final say. A change of direction is written down in ROADMAP.md, a change of process in this file or in CONTRIBUTING.md — through a pull request like any other change.

## Becoming a maintainer and granting access

A contributor can become a maintainer after a sustained record of reviewed, merged contributions and of helping others in issues and discussions. Before anyone gets escalated permissions to a sensitive resource — write or admin access to the repository, environment secrets, npm ownership, the Cloudflare account — the existing maintainers review:

1. the person's contribution history and conduct in the project;
2. that their GitHub, npm and Cloudflare accounts use two-factor authentication;
3. which resources they actually need — access is granted per resource, at the lowest level that works.

The new member is then added to the table above in the same pull request that records the decision. Access that is no longer needed is removed, and the secrets that member could read are rotated.

## Continuity

The repository, the npm packages and the domain are tied to the owner's GitHub, npm and Cloudflare accounts. When a second maintainer joins, they receive npm ownership and repository admin access so that releases and security fixes do not depend on one person.
