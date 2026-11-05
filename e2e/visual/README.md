# visual + accessibility tests (Playwright)

Opens every example of `apps/docs/src/content/components/*/examples` and:

- `visual.spec.ts` — takes a screenshot in light / dark × LTR / RTL, compares with `__screenshots__/`
- `a11y.spec.ts` — runs axe; any violation fails the pull request
