# @tectra-ng/utils

The utilities apps write again and again next to the components: pipes, directives, validators and small services on signals. They are safe for server rendering (no `window`, `document` or timers on the server), take their texts from the tectra locale, and use the kit components where they show something (the copy directive shows a kit toast).

```bash
npm install @tectra-ng/utils
```

Part of `tectra-ng`. One entry point per utility, so you only bundle what you import:

| Entry point | What it holds |
|---|---|
| `@tectra-ng/utils/date` | `txDate` and `txDateRange` pipes, `provideTxDateFormat`, calendar functions (`addDays`, `startOfWeek`, `calendarDaysBetween` …), format presets and time constants |
| `@tectra-ng/utils/plural` | `txPluralForm` (`one` / `few` / `many` for translation keys) and `txPlural` pipes in the tectra locale |
| `@tectra-ng/utils/debounce-input` | `txDebounceInput` — reports a field's value after a pause, at once on Enter |
| `@tectra-ng/utils/form-validation` | `TxFormValidation.scrollToFirstInvalid`, `txScrollToInvalid` on a form, `markAllTouched` |
| `@tectra-ng/utils/filter-state` | `txFilterState` — filters in local storage and the URL; `TxUrlFilters` / `TxSaveFilters` base classes; `injectStorage`, `TxMemoryStorage` |
| `@tectra-ng/utils/http` | `buildHttpParams`, `retryHttpReads` (back-off, `Retry-After`), `txHttpStatusTone` / `txHttpStatusLabel` pipes |
| `@tectra-ng/utils/relative-time` | `txRelativeTime` — "5 minutes ago", "yesterday", "in 3 days" in the tectra locale |
| `@tectra-ng/utils/validators` | `TxValidators` — code, date, link, password, match, IP, domain, duplicate, time, JSON, price and more, with translated messages in `tx-field-error` |

Docs and examples: [tectra-ng.com](https://tectra-ng.com/components/date).
