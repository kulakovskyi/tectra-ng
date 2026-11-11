# Security policy

## Supported versions

Security fixes go into the latest minor release of every `@tectra-ng/*` package and `tectra-ng`. Older versions are not patched; update to the latest release.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub: **Security → Report a vulnerability** on this repository (private vulnerability reporting). Include the package and version, what an attacker can do, and steps or a small example to reproduce it.

You will get an answer within a few days. Once a fix is released, the advisory is published with credit to you unless you ask otherwise.

## How the packages are published

Releases are built and published by the `release` GitHub Actions workflow through npm trusted publishing (OIDC), so no long-lived npm token exists. Every published version carries npm provenance that links it to the workflow run and the commit it was built from.
