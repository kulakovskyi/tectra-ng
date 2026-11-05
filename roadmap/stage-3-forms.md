# Stage 3 — form fields, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs (`primeng/types/*.d.ts`) and the links-cms wrappers in `libs/ui-kit/*` (usage = files importing the lib, 2026-11-05).

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean.

**Common form-field inputs** (PrimeNG `BaseInput` / `BaseEditableHolder`), wherever they make sense: `size` (small / medium / large), `variant` (outlined / filled), `invalid`, `disabled`, `readonly`, `required`, `name`, `fluid` (+ `<tx-fluid>`), `ariaLabel`, `ariaLabelledBy`, `autofocus`, `tabindex`. Every value control is a `ControlValueAccessor` (`formControl`, `ngModel`) and works with signal forms.

---

## 3.0 Form-field foundation

Shared tokens and behaviour so every field looks and behaves the same.

- [ ] `formField` design tokens: background, filled background, disabled background, border / hover / focus / invalid border, text, placeholder, icon colour, radius, shadow, padding X / Y and font size for sm / md / lg, transition
- [ ] `variant="filled"` styling for every field
- [ ] Focus ring the same on all fields (border + ring token)
- [ ] Invalid state: `invalid` input, `aria-invalid`, red border, works from `control.invalid && control.touched` in the wrapper
- [ ] `readonly` look (no hover border, default cursor)
- [ ] Move `ui/input` and `ui/select` onto these tokens

## 3.1 Input — `ui/input` 🟡

PrimeNG: InputText (`pInputText`), IconField + InputIcon, InputGroup + InputGroupAddon, KeyFilter (`pKeyFilter`). links-cms: `@ui-kit/input` (**239**).

Done: directive on native `input` / `textarea`, `invalid`, `size`.

- [ ] Common inputs: `variant`, `fluid`, `disabled` / `readonly` look, `dt` / `pt` / `unstyled`
- [ ] `<tx-icon-field>` — icon on the left or right (`iconPosition`), padding adjusts automatically
- [ ] `<tx-input-icon>` — tectra icon name or any icon class; clickable icon (button) variant
- [ ] `<tx-input-group>` + `<tx-input-group-addon>` — text / icon / button addons on both sides, joined borders
- [ ] Prefix / suffix text (links-cms `prefix`: `$`, `https://`)
- [ ] Clear button (`showClear`, `(clear)` output), only when there is a value
- [ ] Copy-to-clipboard button with tooltip (links-cms `copyToClipboard`) — needs the stage 5 tooltip, until then `title`
- [ ] `txKeyFilter` directive: presets `int`, `num`, `alpha`, `alphanum`, `hex`, `email`, `money` + own RegExp; blocks typing and paste
- [ ] links-cms filters as presets / options: `positive` (no minus), `noSpaces`, `onlyLatin` (+ extra allowed characters)
- [ ] `inputmode` passes through (native attribute — just document it)
- [ ] Docs: icons, addons, clear, copy, key filter, sizes, variants, invalid, disabled, fluid
- [ ] Tests: key filter presets + paste, clear, icon field padding, group borders

## 3.2 Label — `ui/label`

PrimeNG: FloatLabel (`variant`: over / in / on), IftaLabel. links-cms: `@ui-kit/label` (**353**).

- [ ] `<tx-label>` (native `label` underneath, `for` binding): text, `required` mark, `tooltip` icon, `colon`, `subtle` look, bottom spacing token
- [ ] `<tx-float-label>`: label inside the field that floats on focus / value — variants `over`, `in`, `on`
- [ ] `<tx-ifta-label>`: label inside the field, above the value
- [ ] Works with input, textarea, select, password, number, mask, otp
- [ ] Docs: plain, required, tooltip, float (3 variants), ifta
- [ ] Tests: `for` / `id` link, required mark, floating on value and on focus

## 3.3 Message & hints — `ui/message` (field part)

PrimeNG: Message (`severity`, `variant`, `size`, `icon`, `closable`, `life`). links-cms: `@ui-kit/validation-message` (18) and inputs `description`, `errorText`, `successText` on fields.

- [ ] `<tx-message>`: severities, `variant` (outlined / simple / filled), `size`, icon, closable + `(close)`, auto hide after `life` ms, icon / content / close templates — shared with stage 4 alert
- [ ] `<tx-field-hint>`: help text under a field, linked with `aria-describedby`
- [ ] `<tx-field-error [control]>`: shows the first validation error of a form control after touch (or `showImmediately`); built-in texts for `required`, `email`, `minlength`, `maxlength`, `min`, `max`, `pattern` in us / ua via the locale; custom messages per error key
- [ ] Success text variant (links-cms `successText`)
- [ ] `aria-live` for errors
- [ ] Docs: severities, variants, closable, life, field hint, field error with a reactive form
- [ ] Tests: error appears after touch, custom message, locale switch, describedby

## 3.4 Field layout — `ui/field` (new, links-cms pattern)

Not in PrimeNG. Replaces the label + control + hint + error combination every links-cms form repeats.

- [ ] `<tx-field>`: label, required mark, control slot, hint, error (from the control in the slot), success; vertical and horizontal layout
- [ ] Generates ids and wires `for`, `aria-describedby`, `aria-invalid` automatically
- [ ] Docs: vertical, horizontal, with every control type
- [ ] Tests: wiring of ids and aria attributes

## 3.5 Textarea — `ui/textarea`

PrimeNG: Textarea (`autoResize`, `onResize`). links-cms: `@ui-kit/textarea` (68): `rows`, `resize`, `autoResize`, `maxHeight`, `transparent`, `borderless`.

- [ ] `textarea[txTextarea]` on the form-field tokens (today `txInput` styles it)
- [ ] `autoResize` up to `maxHeight` / `maxRows`, then scroll; `(resize)` output
- [ ] `resize` control (none / vertical), `rows`
- [ ] Counter `maxlength` (`12 / 200`)
- [ ] Borderless / transparent look (links-cms)
- [ ] Docs + tests: auto resize grows and stops at max, counter

## 3.6 Checkbox — `ui/checkbox`

PrimeNG: Checkbox (`binary`, `value` for groups, `indeterminate`, `trueValue` / `falseValue`, `checkboxIcon`, `(onChange)`, icon template). links-cms: `@ui-kit/checkbox` (73): `label`, `icon`, `selectChange`.

- [ ] `<tx-checkbox>` binary and group mode (array value of the form control)
- [ ] `indeterminate`, `trueValue` / `falseValue`
- [ ] Label (click on the label toggles), icon template
- [ ] `<tx-checkbox-group>` helper with `select all`
- [ ] Selection-tile look (links-cms uses checkboxes as option tiles)
- [ ] Keyboard: Space toggles; native input under the hood
- [ ] Docs + tests: binary, group, indeterminate, true / false values, disabled, invalid

## 3.7 Radio button — `ui/radio-button`

PrimeNG: RadioButton (`value`, `(onClick)`). links-cms: none yet (parity).

- [ ] `<tx-radio-button>` + `<tx-radio-group>` (`name`, value from the form control)
- [ ] Arrow keys move inside the group (roving tabindex)
- [ ] Label, sizes, variants, tile look
- [ ] Docs + tests: group, keyboard, disabled option, invalid

## 3.8 Toggle switch — `ui/toggle-switch`

PrimeNG: ToggleSwitch (`trueValue` / `falseValue`, handle template). links-cms: `@ui-kit/switch` (33): `changeSwitch` output.

- [ ] `<tx-toggle-switch>` with `role="switch"`, `aria-checked`
- [ ] `trueValue` / `falseValue`, handle template (icon inside the handle), sizes
- [ ] Label on the left / right
- [ ] Docs + tests: toggle, values, keyboard, disabled, readonly

## 3.9 Password — `ui/password`

PrimeNG: Password (`feedback` meter in an overlay, `toggleMask`, `weak` / `medium` / `strong` labels + regexes, `showClear`, header / content / footer templates). links-cms: `@ui-kit/password` (20): `feedback`.

- [ ] `<tx-password>` on `txInput` + icon field: show / hide toggle
- [ ] Strength meter panel (TxOverlay): weak / medium / strong with own regexes and labels (us / ua), header / content / footer templates for requirements lists
- [ ] Clear button
- [ ] `autocomplete` passes through (`new-password` / `current-password`)
- [ ] Docs + tests: toggle mask, meter levels, custom rules template

## 3.10 Input OTP — `ui/input-otp`

PrimeNG: InputOtp (`length`, `mask`, `integerOnly`, input template). links-cms: `@ui-kit/input-otp` (5): `length`, `integerOnly`, `mask`, `autofocus`.

- [ ] `<tx-input-otp>`: `length`, `integerOnly`, `mask`, sizes, variants
- [ ] Paste the whole code into any cell, Backspace / arrows move between cells, autofocus first cell
- [ ] `autocomplete="one-time-code"` for SMS autofill
- [ ] `(complete)` output when all cells are filled
- [ ] Docs + tests: typing, paste, backspace, integer only

## 3.11 Input mask — `ui/input-mask`

PrimeNG: InputMask (`mask`, `slotChar`, `autoClear`, `unmask`, `characterPattern`, `keepBuffer`, `showClear`, `(onComplete)`). links-cms: `@ui-kit/input-mask` (2).

- [ ] `input[txInputMask]` directive: `9` digit, `a` letter, `*` any, `?` optional part
- [ ] `slotChar`, `autoClear`, `unmask` (value without literals), `characterPattern`
- [ ] Caret handling on typing / Backspace / paste
- [ ] `(complete)` output
- [ ] Docs + tests: phone, date, card patterns, unmask value

## 3.12 Input number — `ui/input-number`

PrimeNG: InputNumber (`mode` decimal / currency, `currency`, `locale`, grouping, min / max fraction digits, `prefix` / `suffix`, `showButtons` + `buttonLayout` stacked / horizontal / vertical, `min` / `max` / `step`, `allowEmpty`, `showClear`). links-cms: none yet (parity; `@ui-kit/amount` formats numbers for display).

- [ ] `<tx-input-number>` formatting while typing with `TxLocaleService` (us / ua separators)
- [ ] Decimal and currency modes, fraction digits, grouping, prefix / suffix
- [ ] Step buttons: stacked, horizontal, vertical; ArrowUp / ArrowDown step; hold to repeat
- [ ] `min` / `max` clamp, `allowEmpty`, clear button
- [ ] Docs + tests: typing with separators, paste, step, clamp, currency per locale

## 3.13 Rating — `ui/rating`

PrimeNG: Rating (`stars`, `readonly`, `allowHalf`, on / off icon templates, `(onRate)`). links-cms: `@ui-kit/rating` (7): `size`, clear button.

- [ ] `<tx-rating>`: `stars`, `readonly`, `allowHalf`, sizes, icon templates
- [ ] Hover preview, keyboard (arrows, Home / End), clear (links-cms)
- [ ] Docs + tests: select, half, keyboard, readonly

## 3.14 Knob — `ui/knob`

PrimeNG: Knob (`min`, `max`, `step`, `size`, `strokeWidth`, `valueColor`, `rangeColor`, `textColor`, `valueTemplate`, `showValue`, `readonly`). links-cms: `@ui-kit/ring-slider` (1): `limit`, `label`, drag + keys.

- [ ] `<tx-knob>`: drag on the ring, keyboard (arrows, Page, Home / End), value template, colours from tokens
- [ ] `limit` (max allowed below `max`, links-cms)
- [ ] Docs + tests: drag, keys, limit, readonly

## 3.15 Slider — `ui/slider`

PrimeNG: Slider (`min`, `max`, `step`, `range` with two handles, `orientation`, `animate`, `minStepsBetweenHandles`, `(onSlideEnd)`). links-cms: none yet (parity).

- [ ] `<tx-slider>`: single and range, horizontal / vertical, step marks
- [ ] Keyboard on each handle, `minStepsBetweenHandles`, `(slideEnd)`
- [ ] Docs + tests: drag, range, keyboard, vertical

## 3.16 Password generator — `ui/password-generator`

Not in PrimeNG. links-cms: `@ui-kit/password-generator` (2): button that generates a password, `PasswordGeneratorService.generatePassword(length)`.

- [ ] `TxPasswordGenerator` service: length, character sets, crypto random
- [ ] `<button txPasswordGenerate>` directive that fills a password field and shows the password
- [ ] Docs + tests: length, sets, fills the bound control
