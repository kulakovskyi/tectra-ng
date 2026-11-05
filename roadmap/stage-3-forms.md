# Stage 3 — form fields, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs (`primeng/types/*.d.ts`) and what the first consumer app needs (usage = files using the part, 2026-11-05).

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean.

**Common form-field inputs** (PrimeNG `BaseInput` / `BaseEditableHolder`), wherever they make sense: `size` (small / medium / large), `variant` (outlined / filled), `invalid`, `disabled`, `readonly`, `required`, `name`, `fluid` (+ `<tx-fluid>`), `ariaLabel`, `ariaLabelledBy`, `autofocus`, `tabindex`. Every value control is a `ControlValueAccessor` (`formControl`, `ngModel`) and works with signal forms.

---

## 3.0 Form-field foundation ✅

Shared tokens and behaviour so every field looks and behaves the same.

- [x] `formField` design tokens: background, filled background (+ hover, focus), disabled and readonly background, border / hover / focus / invalid border, text, disabled text, placeholder (+ invalid), icon colour, radius, shadow, padding X / Y, font size and line height for sm / md / lg, transition — `packages/themes/src/components/form-field.tokens.ts`
- [x] `variant="filled"` styling (input, select)
- [x] Focus the same on all fields: border token + `focusRing.shadow` / `invalidFocusRing.shadow` tokens (none by default)
- [x] Invalid state: `invalid` input, `aria-invalid`, red border and placeholder; without the input the field follows its form control (`injectFieldInvalid`: invalid once touched or dirty)
- [x] `readonly` look (no hover border, default cursor, own background); select does not open
- [x] `ui/input` and `ui/select` moved onto these tokens through shared SCSS mixins (`packages/ui/styles/_form-field.scss`); select panel got its own `select` tokens (overlay, list, option, filter, empty)
- [x] Docs: input variants / states / invalid, select variants / invalid; Theming tab shows `formField` (+ `select`) tokens
- [x] Tests: `injectFieldInvalid`, input variant / invalid from control, select readonly / variant / invalid; e2e: filled differs from outlined, invalid border after blur equals the danger token

## 3.1 Input — `ui/input` ✅

PrimeNG: InputText (`pInputText`), IconField + InputIcon, InputGroup + InputGroupAddon, KeyFilter (`pKeyFilter`). First app usage: **239**.

- [x] Common inputs: `variant`, `fluid` (+ `<tx-fluid>`; default width is the browser's, like PrimeNG), `disabled` / `readonly` look, `dt` (`formField` tokens) / `pt` / `ptOptions` / `unstyled`
- [x] `<tx-icon-field>` (`@tectra/ui/icon-field`) — items before the input go left, `position="end"` right; the padding grows by the measured width of the icons
- [x] `<tx-input-icon>` — tectra icon, registered icon or icon class; text / markup inside
- [x] `<tx-input-group>` + `<tx-input-group-addon>` (`@tectra/ui/input-group`) — text / icon / button / select addons on both sides, joined borders, `inputGroup` tokens
- [x] Prefix / suffix text — `tx-input-icon` with text or a group addon
- [x] Clear button `<tx-input-clear>` with `(cleared)`, only when there is an editable value; works with forms
- [x] Copy button `<tx-input-copy>` with `(copied)`, check icon after copying, translated label (us / ua) — `title` until the stage 5 tooltip
- [x] `txKeyFilter` (`@tectra/ui/key-filter`): presets `pint`, `int`, `pnum`, `num`, `money`, `hex`, `email`, `alpha`, `alphanum` + own RegExp; blocks typing, cleans paste and drop; `validateOnly` reports a `keyFilter` error to the form (like PrimeNG `pValidateOnly`)
- [x] More presets: `positive` (one decimal separator), `nospace`, `latin` + `keyFilterExtra`
- [x] `inputmode` passes through (native attribute)
- [x] Docs: Input (basic, variants, states, invalid, sizes, fluid, design tokens), IconField (icons, text, clear, copy, sizes, filled), InputGroup (text, icons, buttons, select, fluid), KeyFilter (presets, more presets, RegExp, validate only)
- [x] Tests: key filter presets + typing + paste + validate only, icon field slots / clear / copy, group, input fluid / dt / pt / unstyled; e2e: icon padding, clear, typing and paste filtering, joined group borders

Icons and group addons use the muted text colour (surface 600) instead of surface 500 so text addons pass WCAG AA.

## 3.2 Label — `ui/label` ✅

PrimeNG: FloatLabel (`variant`: over / in / on), IftaLabel. First app usage: **353**.

- [x] `<tx-label>` (native `label` underneath, `for`): text, `required` mark, `tooltip` help icon (focusable, `title` until the stage 5 tooltip), `colon`, `subtle` look; `label` tokens incl. bottom spacing
- [x] `<tx-float-label>`: label inside the field that floats on focus / value — variants `over`, `in`, `on`; placeholder hidden until focus; focus and invalid colours; `floatLabel` tokens
- [x] `<tx-ifta-label>`: label inside the field above the value; `iftaLabel` tokens
- [x] Fields expose their state for labels: `tx-input--filled` (`injectFieldFilled`), `tx-select--filled`, select `inputId`; the field padding top / bottom can be raised by the label (`--tx-field-padding-top` / `-bottom`)
- [x] Works with input, textarea, select, password (`tx-password--filled`), input number (`tx-input-number--filled`) and masked inputs (`txInput`)
- [x] Docs: plain, required + colon + help, subtle, float (3 variants), ifta, with a select
- [x] Tests: `for` link, marks, filled class on value, ifta; e2e: label click focuses the field, float label moves up on focus and stays up with a value, select named by its label

## 3.3 Message & hints — `ui/message` (field part) ✅

PrimeNG: Message (`severity`, `variant`, `size`, `icon`, `closable`, `life`). First app usage: 18; fields also need a description, an error text and a success text. The first app's own alert (546 uses: `severity`, `text`, `icon` with the `pi-` prefix, `size`, `variant`) and validation message (`control`, `showImmediately`, `successText`, `error.message`) map onto these one to one.

- [x] `<tx-message>`: 8 severities, `variant` (tinted by default, `outlined`, `text`, `simple`), `size` (small / medium / large), icon (none by default; tectra name, `pi-` name or icon class), `text` or content, closable + `(closed)` after the leave animation, auto close after `life` ms, icon / close icon templates; `role="alert"` for danger / warn, `status` otherwise; `message` tokens — shared with stage 4 alert
- [x] `<tx-field-hint>`: help text under a field (`secondary` / `success`, icon), `for` adds it to the field's `aria-describedby`
- [x] `<tx-field-error [control]>`: first validation error after touch or change (or `showImmediately`); built-in texts for `required`, `email`, `minlength`, `maxlength`, `min`, `max`, `pattern` + fallback in us / ua via the locale; own texts per error key (`messages`, string with `{param}` or function), app-wide `provideTectra({ validationMessages })`, `error.message` of custom validators
- [x] Success text (`successText` on the error, `severity="success"` on the hint)
- [x] `aria-live="polite"` for errors; `for` wires `aria-describedby` (`linkDescribedBy` / `injectDescribedBy` in `@tectra/core/a11y`)
- [x] Docs: severities, variants, sizes, icons, content, closable, life, field hint, field error with a reactive form, custom messages, success, design tokens, pass-through
- [x] Tests: error appears after touch, next errors, success, custom / function / global messages, `error.message`, locale switch, describedby, close after animation, life, dt / pt / unstyled; e2e: close, errors on submit linked to the field

Icons: `TxIconRegistry` also accepts PrimeIcons names with the `pi-` prefix (`pi-check` → `check`); a full class (`pi pi-check`) stays a class.

## 3.4 Field layout — `ui/field` (new) ✅

Not in PrimeNG. Replaces the label + control + hint + error combination every form repeats. The first app's input bundles `label`, `description`, `control`, `errorText`, `successText` — the same set.

- [x] `<tx-field>`: label (required, colon, tooltip, subtle), control slot, hint, error from the projected `formControl` / `formControlName` / `ngModel` (or `control`), `errorText` from outside the form (marks the control invalid through `TX_FIELD_STATE` in `@tectra/core/forms`), success text, own messages; vertical and horizontal layout (stacks below 40rem); `field` tokens, `dt` / `pt` / `unstyled`
- [x] Finds the control inside (input, textarea, select, `tx-select` trigger, roles combobox / switch / checkbox / radiogroup / slider / spinbutton), gives it an id when it has none, points `for` at it, adds hint and error to `aria-describedby`; `aria-invalid` comes from the control
- [x] Docs: basic, horizontal, every control type, validation, server error, success, design tokens
- [x] Tests: id / `for` / describedby wiring, own id kept, `tx-select` trigger, error from the projected control, `errorText` invalid, layout, dt / pt; e2e: label click focuses, horizontal columns, select error linked

## 3.5 Textarea — `ui/textarea` ✅

PrimeNG: Textarea (`autoResize`, `onResize`). First app usage: 68: `rows`, `resize`, `autoResize`, `maxHeight`, `transparent`, `borderless`.

- [x] `textarea[txTextarea]` on the form-field tokens — `TxInput` is a host directive, so size / variant / invalid / fluid / `pt` / `unstyled` are the same; `fieldDt` for the `formField` tokens, `dt` for the new `textarea` tokens (`textarea[txInput]` keeps working)
- [x] `autoResize` up to `maxHeight` (px) / `maxRows`, then scroll; follows form writes and width changes; `(heightChange)` output
- [x] `resize` control (none / vertical / horizontal / both; off with auto resize), `rows`
- [x] Counter `<tx-textarea-counter [for]>` (`12 / 200`, red at the limit, plain length without `maxlength`)
- [x] Borderless / transparent look (`borderless`, focus ring kept)
- [x] Docs: basic, auto resize, max rows, resize, counter, borderless, variants, states, sizes, form, design tokens
- [x] Tests: auto resize grows and stops at max, form writes, counter, classes / tokens, invalid from the control; e2e: real growth to the limit, counter; registry builder reads inputs of host directives (`'dt: fieldDt'`)

## 3.6 Checkbox — `ui/checkbox` ✅

PrimeNG: Checkbox (`binary`, `value` for groups, `indeterminate`, `trueValue` / `falseValue`, `checkboxIcon`, `(onChange)`, icon template). First app usage: 73 (104 tags): `label`, `icon`, `control` / `ngModel`, `selectChange`.

- [x] `<tx-checkbox>` on a native `input type="checkbox"`: binary by default, array mode with `value` (own form control or the group's), `binary` to force
- [x] `indeterminate` (two-way, `aria-checked="mixed"` from the native property), `trueValue` / `falseValue`
- [x] Label (click toggles), content after the label, `description` with `aria-describedby`, `icon` / `indeterminateIcon`, `txCheckboxIcon` template, `(changed)` `{ checked, value, originalEvent }`
- [x] `<tx-checkbox-group>`: array value, `selectAll` (mixed when partial, translated label), vertical / horizontal, `name` / `size` / `variant` / disabled / invalid passed to the items, `role="group"`
- [x] Selection-tile look (`tile`: the whole card toggles, checked border and background)
- [x] Keyboard: Space toggles; native input under the hood; `readonly`, `disabled`, `required`, `inputId`, `ariaLabel`, `ariaLabelledBy`, `tabindex` (no `autofocus` — the a11y lint forbids it); sizes, `filled`; `checkbox` tokens, `dt` / `pt` / `unstyled`
- [x] Docs + tests: binary, description, array, group + select all, indeterminate, true / false values, tiles, sizes, variants, states (disabled / readonly / invalid), icon, form with `requiredTrue`, design tokens; e2e: Space, label click, select all, tile click. Registry builder: `model()` outputs (`indeterminateChange`), first declaration wins

## 3.7 Radio button — `ui/radio-button` ✅

PrimeNG: RadioButton (`value`, `(onClick)`). Not used by the first app yet (parity).

- [x] `<tx-radio-button>` + `<tx-radio-group>` (`role="radiogroup"`, generated `name`, value from the form control; a radio also works alone with a control)
- [x] Arrow keys move inside the group and Tab enters at the checked option — native radios with one `name`
- [x] Label, `description`, sizes, `filled`, tile look, `readonly`, disabled option / group, `required`, invalid from the group control; `radioButton` tokens, `dt` / `pt` / `unstyled`
- [x] Docs + tests: group, horizontal, description, tiles, standalone, sizes, variants, states, form, design tokens; e2e: arrow keys, group named by `tx-field`. `tx-field` now names groups (`radiogroup` / `group`) with `aria-labelledby` and describes the group

## 3.8 Toggle switch — `ui/toggle-switch` ✅

PrimeNG: ToggleSwitch (`trueValue` / `falseValue`, handle template). First app usage: 33 (43 tags): `control` / `ngModel`, `disabled`, `changeSwitch` output with `{ checked, originalEvent }`.

- [x] `<tx-toggle-switch>` on a native checkbox with `role="switch"`, `aria-checked`
- [x] `trueValue` / `falseValue`, handle template (`txToggleSwitchHandle`) and `onIcon` / `offIcon`, sizes, `(changed)` `{ checked, value, originalEvent }`
- [x] Label on the left / right (`labelPosition`), `description`, `readonly`, disabled / invalid from the form control; `toggleSwitch` tokens, `dt` / `pt` / `unstyled`
- [x] Docs + tests: toggle, values, handle icons / template, sizes, states, form, settings list, design tokens; e2e: Space, label click, handle position

## 3.9 Password — `ui/password` ✅

PrimeNG: Password (`feedback` meter in an overlay, `toggleMask`, `weak` / `medium` / `strong` labels + regexes, `showClear`, header / content / footer templates). First app usage: 20 (28 tags): `label` as placeholder, `control`, `feedback`, `description`, always a show / hide toggle.

- [x] `<tx-password>` on `txInput`: show / hide toggle (`aria-pressed`, translated label), form control value accessor, size / variant / fluid / invalid / disabled / readonly / required / maxlength / name / inputId / aria inputs
- [x] Strength meter panel (`TxOverlay`, field width, closes on blur / Escape): weak / medium / strong with own regexes and labels (us / ua), `(strengthChange)`, header / content / footer templates for requirements lists, meter text linked with `aria-describedby` and `aria-live`
- [x] Clear button (`showClear`, `(cleared)`)
- [x] `autocomplete` passes through (`current-password` by default, `new-password`)
- [x] Works in `tx-float-label` and `tx-field`; `password` tokens + `formField`; shared action button mixin `ui/styles/_input-action.scss`
- [x] Docs + tests: toggle mask, meter levels, custom rules, requirements template, clear, float label, sizes, states, sign-up form with confirmation, design tokens; e2e: meter under the field at its width, toggle keeps focus, Escape, float label

## 3.10 Input OTP — `ui/input-otp` ✅

PrimeNG: InputOtp (`length`, `mask`, `integerOnly`, input template). First app usage: 5: `length`, `integerOnly`, `mask`, `autofocus`, cells split in two groups.

- [x] `<tx-input-otp>`: `length`, `integerOnly` (numeric keyboard), `mask`, `groupSize` separator, sizes, variants, one string value through the form control
- [x] Paste the whole code into any cell (spaces dropped), Backspace / Delete / arrows / Home / End move between cells, `autoFocus` focuses the first cell (the a11y lint forbids the `autofocus` attribute)
- [x] `autocomplete="one-time-code"` for SMS autofill (a multi-character fill spreads over the cells)
- [x] `(completed)` output when all cells are filled
- [x] `role="group"` named by `ariaLabel` / `tx-field`, each cell "Character 1 of 6" (us / ua), invalid / disabled / readonly from the form; `inputOtp` tokens + `formField`
- [x] Docs + tests: typing, paste, autofill, backspace, arrows, integer only, mask, groups, sizes, states, verification form, design tokens; e2e: typing jumps, Backspace, paste completes

## 3.11 Input mask — `ui/input-mask` ✅

PrimeNG: InputMask (`mask`, `slotChar`, `autoClear`, `unmask`, `characterPattern`, `keepBuffer`, `showClear`, `(onComplete)`). First app usage: 2.

- [x] `input[txInputMask]` directive (own value accessor, pairs with `txInput`): `9` digit, `a` letter, `*` any, `?` optional part, other characters fixed
- [x] `slotChar` (one character or a hint of the mask's length), `autoClear` (off = keep the partial buffer), `unmask` (value without literals), `characterPattern`
- [x] Caret handling on typing / Backspace / Delete / selection / cut / paste through `beforeinput`, never past the first empty position, `input` fallback for IME and autofill; pure engine in `mask-engine.ts`
- [x] `(completed)` output; clear button through `tx-icon-field` + `tx-input-clear`
- [x] Docs + tests: phone, date, card, letters, optional part, unmask, slot char, auto clear, clear, form; engine specs; e2e: typing, Backspace over literals, blur clear / keep

## 3.12 Input number — `ui/input-number` ✅

PrimeNG: InputNumber (`mode` decimal / currency, `currency`, `locale`, grouping, min / max fraction digits, `prefix` / `suffix`, `showButtons` + `buttonLayout` stacked / horizontal / vertical, `min` / `max` / `step`, `allowEmpty`, `showClear`). Not used by the first app yet (parity); it formats amounts for display elsewhere.

- [x] `<tx-input-number>` formatting while typing with `Intl.NumberFormat` and `TxLocaleService` (us / ua separators, switches at runtime, `locale` override), caret kept by digit count, `role="spinbutton"` with `aria-valuenow` / `min` / `max`
- [x] Decimal and currency modes (`currency`, `currencyDisplay`, symbol placed per locale), fraction digits, grouping, prefix / suffix; `.` and `,` both start the fraction when the locale uses a comma
- [x] Step buttons: stacked, horizontal, vertical; ArrowUp / ArrowDown step (decimal steps without float noise), Home / End to min / max, hold to repeat
- [x] `min` / `max` clamp (blur, Enter, steps; buttons disable at the limits, `min ≥ 0` blocks the minus), `allowEmpty`, clear button, `(changed)`; float label (`tx-input-number--filled`), `inputNumber` tokens + `formField`
- [x] Docs + tests: typing with separators, paste, step, clamp, currency per locale, locale switch, buttons, clear, float label, sizes, states, form with min / max, design tokens; `TxNumberFormat` specs; e2e: grouping while typing, caret in the middle, held button repeats, locale switch

## 3.13 Rating — `ui/rating` ✅

PrimeNG: Rating (`stars`, `readonly`, `allowHalf`, on / off icon templates, `(onRate)`). First app usage: 7: `stars`, `readonly`, `size`, clear button with a label.

- [x] `<tx-rating>`: `stars`, `readonly`, `allowHalf` (half fill drawn by clipping the filled icon, works with any icon), sizes, `onIcon` / `offIcon`, on / off icon templates, `(rated)`
- [x] Hover preview, keyboard (arrows, Home / End, number keys, Delete / Backspace / 0 clear), `clearable` + `clearLabel`, one focusable `role="slider"` with "3 of 5" value text (us / ua)
- [x] Invalid / disabled from the form control; `rating` tokens, `dt` / `pt` / `unstyled`; `tx-field` names non-native controls with `aria-labelledby`
- [x] Docs + tests: select, half, keyboard, readonly, clear, stars, icons, template, sizes, form, design tokens; e2e: hover preview, keys, half click, field naming

## 3.14 Knob — `ui/knob`

PrimeNG: Knob (`min`, `max`, `step`, `size`, `strokeWidth`, `valueColor`, `rangeColor`, `textColor`, `valueTemplate`, `showValue`, `readonly`). First app usage: 1: `limit`, `label`, drag + keys.

- [ ] `<tx-knob>`: drag on the ring, keyboard (arrows, Page, Home / End), value template, colours from tokens
- [ ] `limit` (max allowed below `max`)
- [ ] Docs + tests: drag, keys, limit, readonly

## 3.15 Slider — `ui/slider`

PrimeNG: Slider (`min`, `max`, `step`, `range` with two handles, `orientation`, `animate`, `minStepsBetweenHandles`, `(onSlideEnd)`). Not used by the first app yet (parity).

- [ ] `<tx-slider>`: single and range, horizontal / vertical, step marks
- [ ] Keyboard on each handle, `minStepsBetweenHandles`, `(slideEnd)`
- [ ] Docs + tests: drag, range, keyboard, vertical

## 3.16 Password generator — `ui/password-generator`

Not in PrimeNG. First app usage: 2: button that generates a password, `PasswordGeneratorService.generatePassword(length)`.

- [ ] `TxPasswordGenerator` service: length, character sets, crypto random
- [ ] `<button txPasswordGenerate>` directive that fills a password field and shows the password
- [ ] Docs + tests: length, sets, fills the bound control
