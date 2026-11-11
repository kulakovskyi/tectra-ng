# Stage 12 — utils, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Utilities live in `@tectra-ng/utils/<name>` — own package, one flat entry point per utility (the same split as the first consumer app's utility library, so an import changes its path and prefix only). Usage = files of the first consumer app that import the utility (counted 2026-11-11). Reference: the first app's utility library (API, defaults, behaviour) and the PrimeNG directives / services of the same role (`AnimateOnScroll`, `Defer`, `AutoFocus`, `StyleClass`, `FilterService`, `ObjectUtils`).

**Package decision (2026-11-11):** a separate package, not `@tectra-ng/core` and not `@tectra-ng/ui`. Apps import directives, pipes and helpers without a component; its peers (`@angular/forms`, `@angular/common/http`, `@angular/router`) stay out of core, which every package depends on. It sits above `ui` like `charts` and `editor` (`pkg:utils` → ui and below), so the copy directive shows the kit toast and validation messages come from the kit locale; `blocks` may use it. Helpers a ui component needs itself stay in `@tectra-ng/core/utils`.

**Every item also needs** (not repeated below): README (Inputs / Outputs for directives; the pipes and functions in the docs page body), docs page (category `Utilities`, `source:` / `package:` front matter) with an example per feature built from kit components, unit tests, server rendering safe (no `window` / `document` / timers on the server — `DOCUMENT`, `afterNextRender`, `isPlatformBrowser`), texts from `@tectra-ng/core/i18n` in every locale, e2e only where the browser shows something the unit test cannot, lint clean.

**Not carried over (stays in the app or is already in the kit):** `unsubscribe-base` (865) → Angular `DestroyRef` / `takeUntilDestroyed`; `modal` (550) → `ui/dialog`; `custom-toastr` (208) → `ui/toast`; `default-avatar` (46) → `ui/avatar` fallback; `highlight` pipe (4, wrote unescaped HTML) → `ui/highlight-text`; `upload-image` (10) → `ui/file-upload`; `remaining-time` → `ui/countdown` (`txRemainingTime`); `split-input`, `plural-count`, `calculate-total`, `normalize-keyword` pipe (0 each) → `ui/list-input`, `formatMessage` plurals, plain code; app wiring: app date / number format constants, request tokens, interceptor, error reporter, session expiry / refresh, fetch with auth, auth route loader, storage clean-up on a new version, splash screen, feature flags; PrimeNG `DragDrop` → Angular CDK drag and drop (`blocks/kanban` uses it); app-specific validators (URLs of particular services, a percentage total of one form) → the generic ones below.

---

## 12.0 Package ✅

- [x] `@tectra-ng/utils` is a published package: `project.json` (`build`, `test`, tag `pkg:utils`), `package.json` (peers on `@tectra-ng/*` and Angular, `@angular/common/http` / `@angular/router` / `@angular/forms` where used, no dependencies, `publishConfig`), `ng-package.json`, `tsconfig.base.json` paths, module boundary (`pkg:utils` → ui and below; `pkg:blocks` may use it), `build:packages` / `test` scripts, `release.projects`, part of `tectra-ng`, install docs (root README, `packages/tectra-ng/README.md`, `INSTALL_PACKAGES`), docs category `Utilities`
- [x] Docs API tab shows the extra README tables of a utility page (`Pipes`, `Functions`, `Methods`, `Options`)

## 12.1 Dates — `utils/date` (check-date 318, date 42, date-range 34, is-expiring-within 1) ✅

- [x] `txDate` pipe: Angular date patterns (`'dd.MM.yy HH:mm'`, `'mediumDate'` by default), `'-'` (or own text) for an empty or broken value instead of an error, a locale (`en-US` by default, as the first app), time zone
- [x] Global defaults: `provideTxDateFormat({ format, empty, locale, timezone })`
- [x] Format presets as constants (`TX_DATE_FORMATS`: date-time, date, time, ISO day, ISO month, day-month) and time constants (`MS_IN_SECOND` … `MS_IN_DAY`, `DAYS_IN_WEEK`)
- [x] Functions: `addDays`, `addMonths`, `addYears`, `startOfDay`, `endOfDay`, `middleOfDay`, `startOfWeek` (first day of week from the locale), `calendarDaysBetween`, `isSameDay`, `toIsoDay`, `toIsoString`, `isExpiringWithin`
- [x] `txDateRange` pipe + `toIsoRange()` — `[start, end]` from a range datepicker → `{ start, end }` ISO strings or `null`

## 12.2 Plural forms — `utils/plural` (plural-form 173) ✅

- [x] `txPluralForm` pipe + `pluralForm(count, locale?)` → `'one' | 'few' | 'many'` for translation keys, locale from the tectra locale by default; `txPlural` pipe over `formatMessage` (`{count, plural, …}`)

## 12.3 Debounced input — `utils/debounce-input` (79) ✅

- [x] `txDebounceInput` directive: `debounceTime` (1000 by default), `debounceInput` output with the event, Enter emits at once, cancels on destroy; works on `txInput`, textarea and kit fields with a native input inside; `distinct` (skip the same value), `minLength`

## 12.4 Form validation — `utils/form-validation` (70) ✅

- [x] `TxFormValidation.scrollToFirstInvalid(form)`: marks every control touched and dirty, scrolls the first invalid field into the middle (smooth, instant with reduced motion, above a sticky header), focuses the kit field's own input (select, datepicker, multiselect …)
- [x] `markAllTouched(form)` function for nested groups and arrays; `txScrollToInvalid` on a `<form>` (`validSubmit` / `invalidSubmit`)

## 12.5 Filter state — `utils/filter-state` (save-filters-base 65, url-filters-base 5, memory-storage 1) ✅

- [x] `txFilterState({ key, initial, url, storage })` — a signal of the filters, saved in local storage and (optionally) in the query string only with the values that differ from `initial`, restored on load and on back / forward, `set`, `patch`, `reset`
- [x] `TxSaveFilters` / `TxUrlFilters` base classes with the first app's protected API (`storeFilters`, `getStoredFilters`, `applyUrlFilters`, `localStorageKey`, `initialFilters`) for a drop-in switch
- [x] Pure functions: `filtersToQueryParams`, `queryParamsToFilters`, `encodeUrlFilterValue`, `decodeUrlFilterValue`
- [x] Storage on the server and with blocked storage: `TxMemoryStorage`, `injectStorage('local' | 'session')`

## 12.6 HTTP — `utils/http` (http-params 53, http-status 41, http-retry 4) ✅

- [x] `buildHttpParams(query)` — skips `null` / `undefined` / `''` / empty arrays, repeats array keys, dates as ISO, objects as JSON
- [x] `retryHttpReads(options)` operator: retries 429 / 502 / 503 / 504 and network errors with exponential back-off, honours `Retry-After`; `parseRetryAfter`, `httpRetryDelay`
- [x] `txHttpStatusTone` pipe → kit severity (`success`, `info`, `warn`, `danger`, `secondary`) for `tx-tag` / `tx-status-icon`; `txHttpStatusLabel` pipe → translated text (OK, Redirect, Client error, Server error, No response); extra warn codes as an option

## 12.7 Relative time — `utils/relative-time` (48) ✅

- [x] `txRelativeTime` pipe: "just now", "5 minutes ago", "yesterday", "in 3 days", months, years through `Intl.RelativeTimeFormat` in the tectra locale; `granularity: 'time' | 'day'`, `largestUnit: 'day'`, `now`; `relativeTime()` function; live update with `TxClock`

## 12.8 Validators — `utils/validators` (validators 39, price 6)

- [ ] Generic validators with the first app's error keys: `numericCode(length)`, `isoDate`, `futureDate`, `url({ https, host })`, `strongPassword({ minLength, upper, lower, digit, symbol })`, `matchFields(a, b)` (password confirm), `distinctFields(a, b)`, `ip({ cidr, ipv6 })`, `domain`, `duplicate(taken, options)`, `time24`, `noUnsafeChars`, `jsonObject`, `exactValue`, `cssSelector`, `requiredWhen(field, predicate)`, `arraySumMax(field, max)`, `price` + `parsePrice`
- [ ] Each error key has a translated message in `tx-field-error` (every locale)

## 12.9 Copy to clipboard — `utils/clipboard` (38)

- [ ] `txCopy` directive: copies its value on click, a "Copied to clipboard" kit toast (translated; own text or off), `copied` / `copyFailed` outputs, works without a secure context (fallback), keyboard (Enter / Space on a non-button host); `copyToClipboard(text)` function

## 12.10 Polling — `utils/polling` (24)

- [ ] `poll(config)`: repeat a request while `isActive(value)`, fixed or back-off delay, `maxAttempts`, pause while the tab is hidden, retries, `skipErrors`, `initial`
- [ ] `refreshEvery(config)`: timer refresh with `when`, `immediate`, hidden-tab pause, no overlap
- [ ] `TxPoller` class with `isLoading` / `isPolling` / `error` signals, `watch`, `restart`, `stop`; `POLL_DEFAULT_DELAY`, `POLL_SLOW_DELAY`

## 12.11 Clock — `utils/clock` (18)

- [ ] `TxClock` service: `now` signal ticking every second in the browser only (no timer on the server), `countdown(target, endingSoonMs)` → `remainingMs`, `isExpired`, `isEndingSoon` signals, `isInFuture(value)`

## 12.12 Go back — `utils/go-back` (9)

- [ ] `txGoBack` directive: back in history on click, a `fallback` route when the page was opened directly

## 12.13 Currency symbol — `utils/currency` (8)

- [ ] `txCurrencySymbol` pipe + `currencySymbol(code, locale?)` for any ISO currency through `Intl` (`narrowSymbol`), the code itself when unknown

## 12.14 In view — `utils/in-view` (in-view 7, visible-on-scroll 1; PrimeNG `AnimateOnScroll`, `Defer`)

- [ ] `txInView` directive: `isInView` signal (`exportAs`), `tx-in-view` class, `threshold`, `rootMargin`, `once`, `entered` / `left` outputs, `enterClass` / `leaveClass` for scroll animations; visible on the server
- [ ] `*txDefer` — renders its content when it scrolls into view (`loaded` output)
- [ ] `txVisibleOnScroll` directive: a list in a scrolling box reports each fully visible item id once (`ignore` items, ids forgotten when they leave the list)

## 12.15 Files — `utils/file` (file 5, file-size 6)

- [ ] `txFileSize` pipe + `formatFileSize(bytes, { decimals, base })`: B / KB / MB / GB / TB in the locale number format, `'-'` for no size
- [ ] `downloadFile(url, name)`, `downloadBlob(blob, name)` (browser only)

## 12.16 Page title — `utils/title` (app-title 5)

- [ ] `provideTxTitle({ appName, separator, translate })` — route titles as "Page · App", `TxTitle.setPrefix('(3)')` for counters, a translation function for title keys

## 12.17 Breakpoints — `utils/breakpoint` (track-breakpoint 5)

- [ ] `TxBreakpoints` service: `isMobile` (≤ 640px), `isTablet` (≤ 768px) signals and `matches(query)` → signal; `false` on the server

## 12.18 Selection — `utils/selection` (4)

- [ ] `TxSelection<T>` with the first app's API (`select(predicate, items, checked)`, `toggleOne`, `isSelected`, `clear`, `setSelected`, `areAllSelected`, `areAllSelectedWithPredicate`, `selectedIds`) + `count`, `toggleAll(items)`, `isPartial(items)` for a header checkbox

## 12.19 Stop propagation — `utils/stop-propagation` (4)

- [ ] `txStopPropagation` directive: stops `click` (or the events listed), optional `preventDefault`

## 12.20 Search filter — `utils/filter` (filter 4; PrimeNG `FilterService`)

- [ ] `filterBySearch(items, query, fields)` and `filterBy(items, value, fields, matchMode, locale)` with the match modes (`startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`, `in`, `lt`, `lte`, `gt`, `gte`, `between`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`), accent and case insensitive, `resolveField(item, 'a.b.c')`, own match modes

## 12.21 Text — `utils/text` (string 2, truncate 2, capitalize 1, normalize-keyword 2, add-http-prefix 0)

- [ ] Pipes `txTruncate` (limit, trail, `position: 'end' | 'middle'`), `txCapitalize`, `txHttpPrefix`
- [ ] Functions `truncate`, `capitalize`, `normalizeKeyword`, `withHttpPrefix`, `transliterate` (Ukrainian / Russian → Latin), `slugify`, `escapeHtml`

## 12.22 Stream — `utils/stream` (3)

- [ ] `readTextStream(response, onChunk)` and an async iterator `textChunks(response)` for streamed answers

## 12.23 Drag scroll — `utils/drag-scroll` (2)

- [ ] `txDragScroll` directive: drag a scrolling box with the mouse (grab cursor, no click after a drag, buttons / links / inputs / `[data-drag-ignore]` stay clickable), `panMode` + `panMove` for a canvas

## 12.24 Form changes — `utils/form-changes` (form-change-tracker 1)

- [ ] `TxFormChangeTracker` with the first app's API (`initFormTracking`, `hasFormChanges`, `updateInitialFormState`, `resetFormToInitial`, `resetFormTracking`) + `trackFormChanges(form)` → `changed` signal; own deep compare (dates by time)

## 12.25 Scroll end — `utils/scroll-end` (scroll-to-bottom 0)

- [ ] `txScrollEnd` directive (infinite scroll): `scrolledToBottom` near the end (`offset` in px), `maxLimit` / `currentCount` stop it, no repeat until new content

## 12.26 Random — `utils/random` (1)

- [ ] `pickRandom(items)`, `pickRandomN(items, count)`

## 12.27 Auto focus — `utils/auto-focus` (PrimeNG `AutoFocus`; `autofocus` in 6 forms)

- [ ] `txAutoFocus` directive: focuses its element (or the kit field's input inside) after render, also inside dialogs and deferred views; `txAutoFocus="false"` turns it off

## 12.28 Style class — `utils/style-class` (PrimeNG `StyleClass`)

- [ ] `txStyleClass` directive: toggles classes on a target (`@next`, `@prev`, `@parent`, `@grandparent` or a selector) with enter / leave classes for animations, `toggleClass`, hide on outside click, Escape and resize
