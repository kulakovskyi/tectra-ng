---
name: new-component
description: Use before adding a tectra component or directive (packages/ui/<name>), or a new feature of an existing one. Entry point layout, signal API, dt / pt / ptOptions / unstyled, styles, forms, overlays, a11y, README, docs page, tests and the roadmap tick — the full definition of done.
---

# New component (or feature) in tectra

Pick the item from the stage checklist (`roadmap/stage-*.md`). It lists the feature set to reach and the "Every item also needs" block. Build the whole feature set, not a subset; small 1–2 px differences from the reference look are fine.

## 1. Entry point

```
packages/ui/<name>/
  index.ts                 public barrel: export * from './src/…' for every public file
  ng-package.json          { "lib": { "entryFile": "index.ts" } }
  README.md                API tables — the docs site reads them (skill docs-examples)
  src/
    <name>.component.ts    (or <name>.directive.ts for a native element: input[txInput])
    <name>.component.html  only when the template is more than a few lines
    <name>.component.scss
    <name>.types.ts        every exported type / union (TxXSize, TxXPart, …)
    <name>.spec.ts         Vitest
```

No alias to register (`@tectra/ui/*` is a wildcard). Several related pieces share one entry point (`ui/label` = label + float label + ifta label). Reference implementations: `ui/button` (component, severities, loading, badge, ripple), `ui/input` (directive on a native element + global styles), `ui/select` (form control + overlay + keyboard), `ui/label` (content projection, state read from projected fields).

## 2. Component class

```ts
@Component({
  selector: 'tx-<name>',
  templateUrl: './<name>.component.html',
  styleUrl: './<name>.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-<name>',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-<name>--disabled]': 'disabled()',
  },
})
export class Tx<Name> {
  readonly size = input<Tx<Name>Size>('medium');
  readonly dt = input<TectraDeepPartial<Tectra<Name>Tokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<Tx<Name>Part, Tx<Name>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('<name>', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-<name>'), ...this.passThrough().root?.style }));
}
```

- `dt` — design tokens of THIS instance: `toStyleObject(dt, '--tx-<kebab-token-key>')` writes them as CSS variables on the host. Type = the component's token type from `@tectra/themes` (skill `design-tokens`).
- `pt` — extra `class` / `style` (object, or a function `({ instance }) => …`) per named part. `Tx<Name>Part` lists the parts (`'root' | 'label' | 'icon' …`); bind `passThrough().<part>?.class/style` on each part element. The global value comes from `provideTectra({ pt: { <name>: … } })` (the string passed to `injectPassThrough`).
- `ptOptions` — `mergeSections` (default true), `mergeProps` (default false).
- `unstyled` — global or local; styles are scoped to `[data-styled]`, so an unstyled component keeps only behaviour and ARIA.
- Inputs that inherit (form state, `<tx-fluid>`, config) are `boolean | undefined` + `optionalBoolean`; resolve with `injectFieldInvalid(this.invalid)`, `injectFluid(this.fluid)`, `injectUnstyled(this.unstyled)`.
- Outputs are verbs in past tense or plain events (`opened`, `closed`, `valueChange`). Two-way values use `model()`.
- Texts the component renders itself (aria labels, "No results", "Copy") come from `injectTranslations()` (`@tectra/core/i18n`); add the key to every locale in `packages/core/i18n/src/locales.ts` and the type in `@tectra/core/config`.
- Ids for ARIA wiring: `uniqueId('tx-<name>')` from `@tectra/core/a11y`.

## 3. Directive on a native element

`input[txInput]`, `button[txButton]` style the native element, so their CSS cannot be encapsulated: put it in `<name>.styles.scss` (selectors `.tx-<name>[data-styled]`), wrap it in an empty `Tx<Name>Styles` component with `ViewEncapsulation.None`, and load it once from the directive constructor: `inject(TxStyleLoader).load(Tx<Name>Styles)`.

## 4. Styles

- Only `var(--tx-<component>-…)` and semantic `var(--tx-…)` tokens; never a hard-coded colour, radius, font size or shadow. Missing value → add a token first.
- Form fields reuse the mixins of `packages/ui/styles/_form-field.scss` (`box`, `hover`, `focus`, `filled`, `invalid`, `readonly`, `disabled`, `placeholder`, `size`) and the shared `formField` tokens — every field looks the same.
- States: hover, focus-visible (focus ring tokens), active, disabled, invalid, readonly, loading where it applies; sizes `small` / `medium` / `large`; `variant` `outlined` / `filled` for fields.
- Light and dark come from the tokens (`light-dark()`), never from `:host-context(.dark)`.
- Animations use the motion tokens and are switched off under `prefers-reduced-motion: reduce`.
- A component must not resize or move other content when it changes state (e2e checks layout shift).

## 5. Forms

Value controls extend `TxFormControlBase<T>` (`@tectra/core/forms`) and provide `NG_VALUE_ACCESSOR` — they work with `formControl`, `ngModel` and signal forms. Read invalid / filled state with `injectFieldInvalid`, `injectFieldFilled`. Expose `inputId`, `ariaLabel`, `ariaLabelledBy` so `<tx-label>` / `<tx-float-label>` can name the field; add `tx-<name>--filled` / `--open` / `--invalid` host classes when float labels must react.

## 6. Overlays

Panels use CDK connected overlay with `txPositions` / `placementFromPosition` and `txAnimateEnter` / `txAnimateLeave` (`@tectra/core/overlay`); keep the panel mounted until the leave animation ends; set `cdkConnectedOverlayDisableClose` and close yourself so the leave animation runs. Panel CSS variables live on the panel element (the overlay is outside the host). Focus trap / list navigation / typeahead / announcer: `@tectra/core/a11y`.

## 7. Accessibility

Follow the WAI-ARIA pattern of the widget (combobox, listbox, tabs, dialog…): roles, `aria-expanded` / `aria-selected` / `aria-controls` / `aria-activedescendant`, focus management, full keyboard map (document it in the README `## Keyboard` table). Visible focus ring. Contrast is checked by axe in both themes.

## 8. Tokens, README, docs, tests

1. Tokens: `packages/themes/src/components/<name>.tokens.ts` + registry + export (skill `design-tokens`).
2. README tables + docs page with one example per feature (skill `docs-examples`).
3. `src/<name>.spec.ts`: a host component in the spec renders it; cover every input / output / keyboard path / form integration / `dt` / `pt` / `unstyled`. jsdom lacks `PointerEvent`, `matchMedia`, `scrollIntoView`, `ResizeObserver` — guard or stub.
4. e2e: the page check is automatic (every docs page, light + dark, axe, CLS). Add an `interactions.spec.ts` test for behaviour the unit test cannot see (real layout, overlay position, animation end state, focus).
5. Tick the checklist items in `roadmap/stage-*.md` and the status in `ROADMAP.md`.
6. Skill `verify` before reporting.
