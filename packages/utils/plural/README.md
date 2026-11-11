# Plural

Plural forms by the language rules. `txPluralForm` turns a count into `one`, `few` or `many` — the suffix of a translation key (`files.one`, `files.few`, `files.many`); `txPlural` picks the text itself from a message or a map of forms. Both follow the tectra locale, also when it changes at runtime.

```html
{{ ('files.' + (count | txPluralForm)) | translate: { count } }}
{{ count | txPlural: '{count, plural, one {# file} other {# files}}' }}
```

## Pipes
| Name | Description |
|---|---|
| txPluralForm: locale? | `one`, `few` or `many` for a count (`Intl.PluralRules`: `one` and `few` as they are, every other category is `many`); the tectra locale unless a locale is given |
| txPlural: forms, locale? | The text for a count: an ICU message (`{count, plural, =0 {none} one {# file} other {# files}}`) or a map `{ '=0', one, few, many, other }`; `#` is the count |

## Functions
| Name | Description |
|---|---|
| pluralForm(count, locale?) | The function behind `txPluralForm`; `en-US` by default |
| pluralCategory(count, locale?) | The full category: `zero`, `one`, `two`, `few`, `many` or `other` |
| plural(count, forms, locale?) | The function behind `txPlural` |
