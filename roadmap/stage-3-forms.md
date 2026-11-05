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
- [x] Works with input, textarea and select; password, number, mask and otp join with the same filled / focus classes when they are built (3.9–3.12)
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

## 3.4 Field layout — `ui/field` (new)

Not in PrimeNG. Replaces the label + control + hint + error combination every form repeats.

- [ ] `<tx-field>`: label, required mark, control slot, hint, error (from the control in the slot), success; vertical and horizontal layout
- [ ] Generates ids and wires `for`, `aria-describedby`, `aria-invalid` automatically
- [ ] Docs: vertical, horizontal, with every control type
- [ ] Tests: wiring of ids and aria attributes

## 3.5 Textarea — `ui/textarea`

PrimeNG: Textarea (`autoResize`, `onResize`). First app usage: 68: `rows`, `resize`, `autoResize`, `maxHeight`, `transparent`, `borderless`.

- [ ] `textarea[txTextarea]` on the form-field tokens (today `txInput` styles it)
- [ ] `autoResize` up to `maxHeight` / `maxRows`, then scroll; `(resize)` output
- [ ] `resize` control (none / vertical), `rows`
- [ ] Counter `maxlength` (`12 / 200`)
- [ ] Borderless / transparent look
- [ ] Docs + tests: auto resize grows and stops at max, counter

## 3.6 Checkbox — `ui/checkbox`

PrimeNG: Checkbox (`binary`, `value` for groups, `indeterminate`, `trueValue` / `falseValue`, `checkboxIcon`, `(onChange)`, icon template). First app usage: 73: `label`, `icon`, `selectChange`.

- [ ] `<tx-checkbox>` binary and group mode (array value of the form control)
- [ ] `indeterminate`, `trueValue` / `falseValue`
- [ ] Label (click on the label toggles), icon template
- [ ] `<tx-checkbox-group>` helper with `select all`
- [ ] Selection-tile look (checkboxes as option tiles)
- [ ] Keyboard: Space toggles; native input under the hood
- [ ] Docs + tests: binary, group, indeterminate, true / false values, disabled, invalid

## 3.7 Radio button — `ui/radio-button`

PrimeNG: RadioButton (`value`, `(onClick)`). Not used by the first app yet (parity).

- [ ] `<tx-radio-button>` + `<tx-radio-group>` (`name`, value from the form control)
- [ ] Arrow keys move inside the group (roving tabindex)
- [ ] Label, sizes, variants, tile look
- [ ] Docs + tests: group, keyboard, disabled option, invalid

## 3.8 Toggle switch — `ui/toggle-switch`

PrimeNG: ToggleSwitch (`trueValue` / `falseValue`, handle template). First app usage: 33: `changeSwitch` output.

- [ ] `<tx-toggle-switch>` with `role="switch"`, `aria-checked`
- [ ] `trueValue` / `falseValue`, handle template (icon inside the handle), sizes
- [ ] Label on the left / right
- [ ] Docs + tests: toggle, values, keyboard, disabled, readonly

## 3.9 Password — `ui/password`

PrimeNG: Password (`feedback` meter in an overlay, `toggleMask`, `weak` / `medium` / `strong` labels + regexes, `showClear`, header / content / footer templates). First app usage: 20: `feedback`.

- [ ] `<tx-password>` on `txInput` + icon field: show / hide toggle
- [ ] Strength meter panel (TxOverlay): weak / medium / strong with own regexes and labels (us / ua), header / content / footer templates for requirements lists
- [ ] Clear button
- [ ] `autocomplete` passes through (`new-password` / `current-password`)
- [ ] Docs + tests: toggle mask, meter levels, custom rules template

## 3.10 Input OTP — `ui/input-otp`

PrimeNG: InputOtp (`length`, `mask`, `integerOnly`, input template). First app usage: 5: `length`, `integerOnly`, `mask`, `autofocus`.

- [ ] `<tx-input-otp>`: `length`, `integerOnly`, `mask`, sizes, variants
- [ ] Paste the whole code into any cell, Backspace / arrows move between cells, autofocus first cell
- [ ] `autocomplete="one-time-code"` for SMS autofill
- [ ] `(complete)` output when all cells are filled
- [ ] Docs + tests: typing, paste, backspace, integer only

## 3.11 Input mask — `ui/input-mask`

PrimeNG: InputMask (`mask`, `slotChar`, `autoClear`, `unmask`, `characterPattern`, `keepBuffer`, `showClear`, `(onComplete)`). First app usage: 2.

- [ ] `input[txInputMask]` directive: `9` digit, `a` letter, `*` any, `?` optional part
- [ ] `slotChar`, `autoClear`, `unmask` (value without literals), `characterPattern`
- [ ] Caret handling on typing / Backspace / paste
- [ ] `(complete)` output
- [ ] Docs + tests: phone, date, card patterns, unmask value

## 3.12 Input number — `ui/input-number`

PrimeNG: InputNumber (`mode` decimal / currency, `currency`, `locale`, grouping, min / max fraction digits, `prefix` / `suffix`, `showButtons` + `buttonLayout` stacked / horizontal / vertical, `min` / `max` / `step`, `allowEmpty`, `showClear`). Not used by the first app yet (parity); it formats amounts for display elsewhere.

- [ ] `<tx-input-number>` formatting while typing with `TxLocaleService` (us / ua separators)
- [ ] Decimal and currency modes, fraction digits, grouping, prefix / suffix
- [ ] Step buttons: stacked, horizontal, vertical; ArrowUp / ArrowDown step; hold to repeat
- [ ] `min` / `max` clamp, `allowEmpty`, clear button
- [ ] Docs + tests: typing with separators, paste, step, clamp, currency per locale

## 3.13 Rating — `ui/rating`

PrimeNG: Rating (`stars`, `readonly`, `allowHalf`, on / off icon templates, `(onRate)`). First app usage: 7: `size`, clear button.

- [ ] `<tx-rating>`: `stars`, `readonly`, `allowHalf`, sizes, icon templates
- [ ] Hover preview, keyboard (arrows, Home / End), clear
- [ ] Docs + tests: select, half, keyboard, readonly

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
