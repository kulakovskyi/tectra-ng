---
name: docs-examples
description: Use when writing or changing tectra documentation — component README API tables, the docs site page (overview.md front matter, examples), example code style, how the registry builder turns them into the site.
---

# Docs in tectra

The site (`apps/docs`) is generated: `tools/registry-builder/build-registry.mjs` (`npm run registry`, runs before every docs serve / build) reads three sources into `apps/docs/src/generated/registry.ts` (git-ignored). A component appears in the navigation and in the e2e page list as soon as its content folder exists.

## 1. Package README — `packages/ui/<name>/README.md`

The API tab comes from these tables. Section names are exact; other text is free.

```md
# Chip

One sentence: what it is and when to use it.

## Inputs
| Name | Description |
|---|---|
| label | Text of the chip |

## Outputs
| Name | Description |
|---|---|
| removed | The remove icon was clicked |

## Slots
| Name | Description |
|---|---|
| txChipIcon | `<ng-template txChipIcon>` — own icon |

## Keyboard
| Key | Action |
|---|---|
| Backspace / Delete | Removes the chip |
```

- Every public input / model / output is listed. Types and defaults are read from the source; the build FAILS when a README name has no declaration in `src/` (typo or renamed member).
- Descriptions are short, plain, user-facing; inline markdown is allowed.

## 2. Docs content — `apps/docs/src/content/components/<name>/`

```
overview.md
examples/<id>.example.ts
examples/<id>.md
```

`overview.md`:

```md
---
category: Form
tokens: chip
examples: basic, removable, sizes, template
---
# Chip

What it is, in one or two sentences.
```

- `category` — navigation group. Existing: `Form`, `Actions`, `Misc`; reuse them, add a new one (`Overlay`, `Data`, `Navigation`, `Media` …) only for a new kind of component.
- `tokens` — registry keys from `COMPONENT_TOKENS` shown on the Theming tab.
- `examples` — order on the page; title = id in title case (`more-presets` → "More presets").

## 3. Examples

- One example per feature: basic, every input group (sizes, variants, severities, states, disabled / readonly / invalid), forms (`formControl`, `ngModel`), templates / slots, `dt` (custom tokens), `pt`, `unstyled`, accessibility notes where useful.
- `<id>.md` — one or two sentences shown under the title (markdown).
- `<id>.example.ts` — a self-contained standalone component, default export:

```ts
@Component({
  selector: '<name>-<id>-example',
  imports: [TxChip],
  template: `…`,
  styles: `.row { display: flex; gap: 12px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class <Name><Id>Example {}
```

- Inline `template` and `styles` (the code panel shows the template in an HTML tab and the full file in a TypeScript tab). Layout styles only — never restyle the component in an example (that is what `dt` / `pt` examples are for).
- Realistic, neutral content: no product, company or app names. Unique ids per page (`<id>-<field>`), every field has an accessible name (label, `aria-label`).
- Examples must actually work (buttons do something, forms update) — the user tries them.
- Run `npm run format:examples` (prettier, width 100) after writing; the builder formats again for display.

## 4. Other pages

Hand-written pages (home, getting started, theming, icons, core/overlay, core/locale) live in `apps/docs/src/app/pages/`; navigation data in `apps/docs/src/app/data/`. New core entry points with user-facing API get a page there.
