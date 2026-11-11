# Relative Time

"5 minutes ago", "yesterday", "in 3 days" — a date said relative to now through `Intl.RelativeTimeFormat` in the tectra locale. Within a day it counts seconds, minutes and hours; past midnight it counts calendar days, then months and years.

```html
{{ comment.createdAt | txRelativeTime }}
{{ task.due | txRelativeTime: { granularity: 'day' } }}
{{ event.at | txRelativeTime: { now: clock.now() } }}   <!-- updates every second with TxClock -->
```

## Pipes
| Name | Description |
|---|---|
| txRelativeTime: options? | The text for a `Date`, ISO string or timestamp; `''` when empty or invalid. Follows the tectra locale |

## Options
| Name | Description |
|---|---|
| locale | An Intl locale instead of the tectra one |
| now | The moment to compare with; `Date.now()` by default. Pass a ticking signal value to keep the text fresh |
| granularity | `time` (default) — seconds, minutes, hours within the same day; `day` — only today, yesterday, in 3 days … |
| largestUnit | `year` (default), `month` or `day` — "45 days ago" instead of "last month" |
| numeric | `auto` (default) — "yesterday", "now"; `always` — "1 day ago", "20 seconds ago" |
| style | `long` (default), `short` or `narrow` — "5 min. ago" |

## Functions
| Name | Description |
|---|---|
| relativeTime(value, options?) | The function behind the pipe; `en-US` unless `locale` is given |
