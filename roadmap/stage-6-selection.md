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

## 6.2 Multiselect — `ui/multiselect`

PrimeNG: MultiSelect (`display` comma / chip, `maxSelectedLabels`, `selectedItemsLabel`, `selectionLimit`, `showToggleAll`, filter, groups, virtual scroll, lazy, templates). First app: 129 + 8 (country), `maxSelectedLabels` 2, `showToggleAll` 6, `selectionLimit`, filter, virtual scroll, lazy.

- [ ] `<tx-multiselect>` on the select option engine: checkbox options, `display` comma / chip (removable chips), `maxSelectedLabels` + translated "{count} selected", `selectionLimit`, toggle all (filtered options only), `showClear`
- [ ] Filter, groups, virtual scroll, lazy, loading, templates as in select
- [ ] Docs + tests; e2e: select all with the filter, chips removal by keyboard

## 6.3 Listbox — `ui/listbox`

- [ ] `<tx-listbox>`: single / multiple (`metaKeySelection`, checkbox), filter, groups, virtual scroll, disabled options, templates, form control

## 6.4 Autocomplete — `ui/autocomplete`

First app: free-text combobox with a dropdown button (2), prefix-filtered suggestions with an icon (1).

- [ ] `<tx-autocomplete>`: `suggestions` + `(completed)` with `delay` and `minLength`, `dropdown` button, `forceSelection`, free text, groups, `multiple` with chips, loading, templates

## 6.5 Chips input — `ui/chips-input`

First app: keywords input 3 (`max`, `maxLength`, `[(keywords)]`), domains input 5 (paste splits by separators / lines).

- [ ] `<tx-chips-input>`: Enter / separator / paste adds, Backspace removes the last, `max`, `maxLength`, duplicates off, `separator`, `addOnBlur`, form control

## 6.6 Country + country select — `ui/country`, `ui/country-select`

First app: flag display 56, country select 16 (single / multiple, counts, hints, sorted localized names).

- [ ] `<tx-country>` flag + name from `Intl.DisplayNames`; `<tx-country-select>` on select / multiselect with flags, counts, hints, "+N" value

## 6.7 The rest — color picker, mention textarea, email suggestion, tree select, cascade select

- [ ] `ui/color-picker` (popover + presets), `ui/mention-textarea`, `ui/email-suggestion`, `ui/tree-select`, `ui/cascade-select` (parity)
