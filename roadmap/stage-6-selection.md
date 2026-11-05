# Stage 6 — selection, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs and what the first consumer app needs (usage = tags in its templates, 2026-11-05). In the first app every selection field goes through one select wrapper (406 tags): `options` 406, `filter` 202, `multiselect` 129, `loading` 95, debounced filter output 17 / 11, server-side `lazy` + `virtualScroll` 8, an empty-filter slot with a "create «query»" button 3, image or flag in options. Its country select (16) adds counts, hints and a "+N more" value; the free-text combobox (2) and the autocomplete (1) are small.

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean.

---

## 6.1 Select parity — `ui/select` ✅

PrimeNG: Select (`options`, `optionLabel` / `optionValue` / `optionDisabled`, `group` + `optionGroupLabel` / `optionGroupChildren`, `dataKey`, `filter` + `filterBy` / `filterMatchMode` / `filterPlaceholder` / `resetFilterOnHide`, `showClear`, `editable`, `loading`, `checkmark`, `virtualScroll` + `virtualScrollItemSize`, `lazy` + `(onLazyLoad)`, `scrollHeight`, `emptyMessage` / `emptyFilterMessage`, `dropdownIcon`, templates item / selectedItem / group / header / footer / empty / emptyfilter, `(onChange)`, `(onFilter)`, `(onClear)`).

- [x] Field structure: a box with the combobox (button, or input when `editable`), clear button, loading spinner and dropdown icon; float / ifta labels, input group and `tx-field` keep working
- [x] Options: objects or plain strings / numbers, nested field paths (`user.name`), `optionDisabled` (skipped by keys, typeahead and clicks), `dataKey` compares object values
- [x] Groups: `group`, `optionGroupLabel`, `optionGroupChildren`, `txSelectGroup` template, `role="group"` named by its header
- [x] Filter: `filterBy` (several fields), `filterMatchMode`, accent and case insensitive, `filterPlaceholder`, `resetFilterOnHide`, `(filtered)` with `filterDelay` for server search
- [x] `showClear` + `(cleared)`; `(changed)` with value and option
- [x] `editable`: free text or a matching option
- [x] `loading`: spinner instead of the dropdown icon, "Loading" in an empty panel, `aria-busy`
- [x] `checkmark` (on by default), `dropdownIcon`, `scrollHeight`, `emptyMessage` / `emptyFilterMessage`
- [x] Virtual scroll (`virtualScroll`, `virtualScrollItemSize`): keys keep the active option in view, `aria-setsize` / `aria-posinset`
- [x] Lazy: `lazy` + `(lazyLoad)` with the range that has no data yet (`null` / `undefined` options render as skeleton rows), remote filtering through `(filtered)`; the chosen option stays shown when it is not in the loaded page
- [x] Templates: `txSelectOption`, `txSelectValue`, `txSelectGroup`, `txSelectHeader`, `txSelectFooter`, `txSelectEmpty`, `txSelectEmptyFilter` (gets the query — "create «query»")
- [x] `dt` / `pt` / `ptOptions` / `unstyled` (panel too)
- [x] Docs + tests: every feature above, image / flag options, server-side infinite list; e2e: virtual scroll with keys, clear, editable

## 6.2 Multiselect — `ui/multiselect` ✅

PrimeNG: MultiSelect (`display` comma / chip, `maxSelectedLabels`, `selectedItemsLabel`, `selectionLimit`, `showToggleAll`, filter, groups, virtual scroll, lazy, templates). First app: 129 + 8 (country), `maxSelectedLabels` 2, `showToggleAll` 6, `selectionLimit`, filter, virtual scroll, lazy.

- [x] Shared pieces in `ui/select`: `tx-option-list` (list, groups, virtual rows, loaders, empty state), `TxOptionsBase` (rows, filter, keys, lazy) and `TxSelectBase` (field + overlay panel), the field styles as a Sass mixin; select rebuilt on them
- [x] `<tx-multiselect>`: checkbox options (`aria-multiselectable`), the panel stays open, `display` comma / chip (remove icon, Backspace removes the last), `maxSelectedLabels` + translated "{count} selected" (`selectedItemsLabel`), `selectionLimit` disables the rest, toggle all as a tri-state checkbox for the visible options and Ctrl / ⌘ + A, `showClear`, `null` value is an empty array
- [x] Filter, groups, virtual scroll, lazy, loading, templates (`txSelectValue` gets the selected items) as in select; float / ifta label and input group know it
- [x] Docs + tests; e2e: select all with the filter (Shift+Tab to the checkbox), chips removal by click and Backspace, the limit, axe on open panels in light and dark

## 6.3 Listbox — `ui/listbox` ✅

PrimeNG: Listbox (`multiple`, `checkbox`, `metaKeySelection`, `filter`, groups, virtual scroll, templates). First app: 0 tags (parity).

- [x] `<tx-listbox>` on the option engine: focusable `role="listbox"` with `aria-activedescendant`, single / multiple (`aria-multiselectable`), `checkbox`, `metaKeySelection` (Ctrl / ⌘ + click adds), Shift + arrows extend, Ctrl / ⌘ + A, typeahead, filter field that drives the list, groups, virtual scroll, lazy, disabled options, header / footer / empty templates, readonly / invalid / disabled, form control; `listbox` tokens
- [x] `tx-field` names a listbox with `aria-labelledby` and describes it with the hint and the error
- [x] Docs + tests; e2e: keyboard selection, field label, virtual list with the search field

## 6.4 Autocomplete — `ui/autocomplete` ✅

PrimeNG: AutoComplete (`suggestions`, `(completeMethod)`, `delay`, `minLength`, `dropdown` + `dropdownMode`, `forceSelection`, `multiple`, `completeOnFocus`, `autoOptionFocus`, `showEmptyMessage`, groups, virtual scroll, templates). First app: free-text combobox with a dropdown button (2), prefix-filtered suggestions with an icon (1).

- [x] `<tx-autocomplete>` on the select base: input `role="combobox"` with `aria-autocomplete="list"`, `suggestions` + `(completed)` after `delay` / `minLength`, `completeOnFocus`, `dropdown` button (`blank` / `current`), free text or `forceSelection` (unknown text cleared on Tab / blur, an exact match is taken), `autoOptionFocus`, `showEmptyMessage`, `localSearch` for fixed lists (match modes, `filterBy`), `maxlength`, `showClear`, loading
- [x] `multiple` with chips (option template inside the chip, Backspace removes the last), values not in the suggestions still shown
- [x] Groups, virtual scroll, lazy, templates; float / ifta label and input group know it
- [x] Docs + tests; e2e: typing + keys, forced selection on Tab, chips, axe on the open panel in light and dark

## 6.5 Chips input — `ui/chips-input` ✅

PrimeNG: InputChips (`separator`, `max`, `maxLength`, `allowDuplicate`, `addOnBlur`, `addOnTab`, item template). First app: keywords input 3 (`max`, `maxLength`, `[(keywords)]`), domains input 5 (paste splits by separators / lines).

- [x] `<tx-chips-input>`: Enter / separator (text or pattern) adds, paste splits by lines and the separator, Backspace removes the last, chips are `tx-chip` with a translated "Remove {item}" button (Delete / Backspace), `max` (read-only when full), `maxLength`, duplicates off (`allowDuplicate`, `caseSensitive`), `itemPattern`, `addOnBlur`, `showClear`, `added` / `removed` / `rejected`, item template, sizes, filled, invalid / readonly / disabled, form control; `chipsInput` tokens; float label and `tx-field` know it
- [x] Docs + tests; e2e: typing, keyboard removal, field height with chips, paste

## 6.6 Country + country select — `ui/country`, `ui/country-select` ✅

Not in PrimeNG. First app: flag display 56 (`code`, `showName`, `round`, `size`), country select 16 (single / multiple, counts, hints, disabled, sorted localized names, search on several fields, virtual list above a threshold, a few flags + "+N more").

- [x] `<tx-country>`: name from `Intl.DisplayNames` in the tectra locale (follows `setLocale`), own `name`, unknown values as text, sizes, rectangle / circle, flag-only mode as a named image; emoji flags by default, `provideTxFlags` with `txFlagIcons` (flag-icons CSS classes) or `txFlagImages(url)`; ISO code list and helpers; `country` tokens
- [x] `<tx-country-select>` on `tx-select` / `tx-multiselect`: all countries or own options (`code`, `value`, `label`, `count`, `hint`, `disabled`), locale-aware sort, search by name or code, virtual list above `virtualScrollThreshold`, flags + "+N" for several values, clear, loading, sizes, states, form control
- [x] Docs + tests; e2e: search by code, flags + counter, flag-only image name

## 6.7 The rest — color picker, mention textarea, email suggestion, tree select, cascade select ✅

PrimeNG: ColorPicker (`inline`, `format` hex / rgb / hsb), TreeSelect, CascadeSelect. First app: own colour input 1 (popover, presets, area / hue / clear labels), mention textarea 1 (users, mentioned users output), email suggestion 4 (`value`, `domain`, `apply`), tree / cascade select 0.

- [x] `ui/color-picker`: button + popover (`role="dialog"`) or `inline`; saturation / brightness area and hue slider by pointer and keys (`role="slider"`, value text), hex field, presets (`aria-pressed`), clear, `format` hex / rgb / hsb (typed and preset colours stay exact), sizes, states; `colorPicker` tokens (gradients included); docs, tests, e2e (drag, keys, preset, axe on the open popover)
- [x] `ui/mention-textarea`: `txTextarea` with suggestions at the caret after a `trigger` (`@` by default, not inside a word), keys from the text field (`aria-activedescendant`), insert `@Name `, `mentionsChange` with who is in the text now, `mentioned`, local or server search (`filtered`, `filterDelay`, `loading`), avatar + description default option, own option template, `lines`, `autoResize`; `mention` tokens; docs, tests, e2e (panel at the caret, keyboard insert)
- [x] `ui/email-suggestion`: completes own domains (`domain`, one or several), fixes typos in common providers (edit distance with transpositions, `knownDomains`), polite live region, text button with translated "Use {email}" / "Did you mean {email}?", `applied`; `suggestEmail` / `editDistance` exported; docs, tests, e2e
- [x] `ui/tree-select`: field + `role="tree"` panel (flat tree items with `aria-level` / `aria-setsize` / `aria-posinset`, keys from the field), `single` / `multiple` / `checkbox` (branch check, partial parents `aria-checked="mixed"`, normalized keys), `[(expandedKeys)]`, selected nodes revealed on open, search keeping ancestors, comma / chip display, clear, disabled / not selectable nodes, icons; `tree` tokens; tree helpers exported; docs, tests, e2e (arrows, branch check, axe on the open tree)
- [x] `ui/cascade-select`: columns per level in one panel (`role="tree"`, a `role="group"` per column, `aria-level` / `aria-expanded`), hover or ArrowRight opens a group, ArrowLeft goes back, disabled items skipped, typeahead per column, `optionGroupChildren` per level, `showPath` + `pathSeparator`, `changed` with the path, opens at the current value, clear; `cascadeSelect` tokens; docs, tests, e2e (keys through three levels, axe on the open columns)
- [x] Float / ifta label and input group know tree select and cascade select
