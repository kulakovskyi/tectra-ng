# Security policy

## Supported versions

| Version | Supported |
|---|---|
| Latest minor release (`0.2.x` today) | Yes |
| Older versions | No — update to the latest release |

Security fixes go into the latest minor release of every `@tectra-ng/*` package and `tectra-ng`.

## Reporting a vulnerability

Please do not open a public issue, discussion or pull request for a security problem.

Report it privately through GitHub: [**Report a vulnerability**](https://github.com/kulakovskyi/tectra-ng/security/advisories/new) (Security tab → Report a vulnerability). Only the maintainer sees the report.

Include:

- the package and version (`@tectra-ng/ui/select 0.2.3`);
- what an attacker can do and under which conditions;
- steps or a small example that reproduces it.

## What happens next

- You get a first answer within **3 working days**.
- The report is confirmed or declined, with the reason, within **10 working days**.
- A confirmed vulnerability is fixed and released as soon as possible, and within **90 days** at the latest.
- After the fixed version is on npm, a GitHub security advisory is published, with credit to you unless you prefer to stay anonymous. Please keep the details private until then (coordinated disclosure).

## How the packages are published

Releases are built and published only by the `release` GitHub Actions workflow from the `main` branch, through npm trusted publishing (OIDC). No long-lived npm token exists. Every published version carries npm provenance that links it to the workflow run and the commit it was built from — check it with `npm audit signatures`.
