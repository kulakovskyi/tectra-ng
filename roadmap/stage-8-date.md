# Stage 8 — date & time, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs (Aura base theme) and what the first consumer app needs (usage = tags in its templates, 2026-11-06). In the first app every date field goes through one calendar wrapper on PrimeNG DatePicker (63 tags): `label` (placeholder) 61, `range` + `[(rangeDates)]` + `(dateRangeChange)` 47, a reactive `control` 12, an own clear icon 6, `dateChange` 4, `showTime`, `minDate` / `maxDate`; it always uses `dd.mm.yy`, Monday as the first day, the icon button on the right and a panel appended to the body. Three more `p-datepicker` tags are used directly. Its month grid with event bars (`month-calendar`, 5), the countdown and the analog clock are its own components. The first app's preset does not override the datepicker, so its look is the Aura `datepicker` tokens on the first app's semantic values. Root font size there is 14px, so `1rem` = 14px.

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean.

---

## 8.1 Date picker — `ui/datepicker` ✅

PrimeNG: DatePicker (`selectionMode` single / multiple / range, `dateFormat` with `d dd o oo D DD m mm M MM y yy @ !` and quoted literals, `inline`, `showIcon` + `iconDisplay` button / input, `showClear`, `showButtonBar` (today / clear), `showTime` + `timeOnly` + `hourFormat` 12 / 24 + `showSeconds` + `stepHour` / `stepMinute` / `stepSecond` + `timeSeparator`, `view` date / month / year, `numberOfMonths` + `responsiveOptions`, `showWeek` + `startWeekFromFirstDayOfYear`, `showOtherMonths` / `selectOtherMonths`, `minDate` / `maxDate` / `disabledDates` / `disabledDays`, `maxDateCount`, `firstDayOfWeek`, `defaultDate`, `readonlyInput`, `keepInvalid`, `hideOnDateTimeSelect`, `showOnFocus`, `touchUI`, `dataType` date / string, `multipleSeparator` / `rangeSeparator`, `shortYearCutoff`, sizes, `variant` filled, `fluid`, `invalid`, templates date / header / footer / decade / button bar / trigger, input, clear, previous, next icons, events select / clear / today / month change / year change / show / close / focus / blur / input). The look: panel `0.75rem` padding with the content border, `lg` radius and the overlay shadow; header padded `0 0 0.5rem` with a bottom line; month / year buttons `0.25rem 0.5rem`, weight 500; weekdays weight 500 with `0.25rem` padding; days `1.75rem` circles with `0.25rem` cell padding, hover on the content hover background, selected solid primary, range in the highlight colours, today on `surface 200` / `surface 700`; month and year views `33.3%` / `50%` cells; time picker and button bar `0.5rem` from a top line; the icon button `2.25rem` (`1.75rem` small, `2.625rem` large) on `surface 100` / `surface 800` joined to the field.

- [x] `<tx-datepicker>` field: input on the kit form field (sizes, filled, invalid, readonly, disabled, `fluid`), typed dates parsed by `dateFormat` (locale default: `mm/dd/yy` us, `dd.mm.yy` ua) and formatted on blur, `keepInvalid`, `readonlyInput`, icon button or icon inside the field, clear button, `showOnFocus`, form control (`formControl`, `ngModel`, signal forms) with `Date`, `Date[]` or string values (`dataType`)
- [x] Panel: connected overlay with flip and the kit motion, `inline`, `touchUI` (centered with a mask), `numberOfMonths` with `responsiveOptions`, header with previous / next and month / year buttons, month and year (decade) views, `view` month / year pickers, week numbers, other-month days, today, min / max, disabled dates / weekdays, `firstDayOfWeek` (locale default)
- [x] Selection: single, multiple (`maxDateCount`), range (start, end, restart before the start, the days up to the hovered or focused day highlighted while the end is open), days of other months pickable by default (`selectOtherMonths`, off in PrimeNG), button bar (today / clear), `hideOnDateTimeSelect`, `defaultDate`
- [x] Time: `showTime`, `timeOnly`, 12 / 24 hours with AM / PM, seconds, steps, hold-to-repeat buttons, typed time, `timeSeparator`
- [x] Templates (date cell, header, footer, decade, button bar, icons) and outputs (selected, cleared, today / clear clicked, month / year change, opened / closed, focused / blurred, typed input)
- [x] Accessibility: `combobox` input with `aria-haspopup="dialog"`, panel `dialog` with a focus trap, days as a `grid` with roving focus — arrows, Home / End, PageUp / PageDown (Shift for years), Enter / Space, Escape back to the input; month / year grids by arrows, translated labels
- [x] Docs + tests; e2e: open under the field and pick, typed dates in three formats, keyboard through the grid, range highlight, clear button beside the icon button, touch dialog centred over the mask; `tx-float-label` / `tx-ifta-label` know the field

## 8.2 Month calendar — `ui/month-calendar` ✅

Not in PrimeNG. First app (5): a month grid that draws events as continuous bars across days (lanes, `+N` overflow per day, `maxLanes`), day markers, a selected day, `weekStartsOn`, `locale`, labels (`more`, `today`, region), `today` override, `dayClick` / `eventClick`, own event template with the segment (`lane`, `column`, `span`, `startsHere`, `endsHere`), keyboard navigation. The look is the first app's own grid (rem × 14px): content-border ring with the `lg` radius on the card background, weekday row on the ground colour (`10.5px` semibold muted, centred narrow names, left-aligned short names from 560px), weeks `49px` narrow or `31.5px` + `21px` per lane + `21px` for `+N` wide, weekend cells tinted with the ground colour, selected day 9% primary, today a `24.5px` primary circle, bars `17.5px` with `5.25px` radius tinted 14% with the tone (24% on hover), `5.25px` dots in the compact grid below 560px of its own width.

- [x] `<tx-month-calendar>` with every option above (same names as the first app's grid; `weekStartsOn` and `locale` follow the kit locale when not set; `info` tone added); event bars and `+N` are mouse shortcuts hidden from screen readers while each day is named with its date, today, markers and events; days of other months and weekend names use the muted text colour and bar text mixes the tone with the text colour, so contrast is AA (the original used opacity)
- [x] Docs + tests; e2e: a bar spans its days and continues next week, arrow keys and Enter, compact dots below 560px, `+N` follows `maxLanes`

## 8.3 Countdown — `ui/countdown` ✅

Not in PrimeNG. First app (1): counts a number down in days / hours / minutes / seconds, shows the value with a suffix, emits `completed` once at zero; a countdown to a timestamp through the clock service.

- [x] `<tx-countdown>`: `value` + `unit` + `suffix` like the first app's countdown (a new value starts again instead of being ignored), `target` date as a clock (`mm:ss` / `h:mm:ss`, like its remaining-time pipe), `format`, `endingSoon` colour, `paused`, `tick` / `completed` (once), value template with days / hours / minutes / seconds, `role="timer"` with `aria-live` off by default, ticks follow the clock (no drift, updates only when the shown value changes), colour transition off with reduced motion; `txRemainingTime` pipe, `formatRemaining`, `splitRemaining`
- [x] Docs + tests; e2e on a fake clock: count down and start again, ending colour and completion, pause, target clock

## 8.4 Analog clock — `ui/analog-clock`

Not in PrimeNG. First app (1): an analog face showing the time of an IANA time zone (local when empty or unknown) and a pipe for a digital `HH:mm` read-out with the hand angles.

- [ ] `<tx-analog-clock>` + `txAnalogClockHands` pipe
- [ ] Docs + tests
