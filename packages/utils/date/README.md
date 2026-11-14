# Date

Dates in templates and code: the `txDate` pipe formats in the tectra locale — with `Intl` date styles by default, or with Angular date patterns — follows a locale switch, and shows `-` instead of an error for an empty or broken value; small calendar functions work on copies and count calendar days, not 24-hour blocks, so daylight saving time does not shift them.

```ts
import { TxDatePipe, TX_DATE_FORMATS, TX_DATE_STYLES, addDays, toIsoRange } from '@tectra-ng/utils/date';
```

```html
{{ order.paidAt | txDate }}                                 <!-- Nov 11, 2026 / 11 лист. 2026 р., or - when empty -->
{{ order.createdAt | txDate: TX_DATE_STYLES.dateTime }}     <!-- Nov 11, 2026, 9:05 AM -->
{{ order.createdAt | txDate: TX_DATE_FORMATS.dateTime }}   <!-- 11.11.26 09:05 -->
```

## Pipes
| Name | Description |
|---|---|
| txDate: format?, timezone?, locale? | Formats a `Date`, ISO string or timestamp in the tectra locale and follows it as it changes. `format` is `Intl.DateTimeFormat` options (`TX_DATE_STYLES.dateTime`, `{ month: 'long', day: 'numeric' }`) or an Angular date pattern (`'dd.MM.yyyy'`, `'mediumDate'` …; month names need the Angular locale data, English otherwise); `timezone` is an offset (`'+0200'`), `'UTC'` or an IANA name; the empty text for `null`, `''` or an invalid date |
| txDateRange | `[start, end]` of a range datepicker → `{ start, end }` ISO strings, or `null` until both ends are picked |

## Providers
| Name | Description |
|---|---|
| provideTxDateFormat(config) | App or component defaults of `txDate`: `format` (`TX_DATE_STYLES.date`), `empty` (`'-'`), `locale` (the tectra locale when not set), `timezone` |

## Functions
| Name | Description |
|---|---|
| toDate(value) | A new `Date` from a `Date`, string or number; `null` when empty or invalid |
| isValidDate(value) | `true` when the value is a real date |
| startOfDay(date) / middleOfDay(date) / endOfDay(date) | 00:00:00.000, 12:00 or 23:59:59.999 of the same day |
| addDays(date, days) | Calendar days forward or back; the time of day stays |
| addMonths(date, months) | Months forward or back; Jan 31 + 1 month → Feb 28 (29) |
| addYears(date, years) | Years forward or back; Feb 29 → Feb 28 |
| startOfWeek(date, firstDayOfWeek?) | Midnight of the first day of its week; Monday (`1`) by default, `0` for Sunday |
| calendarDaysBetween(from, to) | Whole calendar days from one date to another, negative when `to` is earlier |
| isSameDay(a, b) | Both values fall on the same calendar day |
| toIsoDay(date) | `yyyy-MM-dd` in local time |
| toIsoString(value) | ISO string of a date; a string is returned as it is; `undefined` when empty |
| toIsoRange(range) | The function behind `txDateRange` |
| isExpiringWithin(date, periodMs?, now?) | The date is past or comes within the period (a week by default) |

## Constants
| Name | Description |
|---|---|
| TX_DATE_STYLES | `Intl` styles in the locale: `date` (Nov 11, 2026), `dateTime` (Nov 11, 2026, 9:05 AM), `time` (9:05 AM), `shortDate` (11/11/26), `longDate` (November 11, 2026) |
| TX_DATE_FORMATS | Patterns: `dateTime` `dd.MM.yy HH:mm`, `date` `dd.MM.yyyy`, `time` `HH:mm:ss`, `timeShort` `HH:mm`, `isoDay` `yyyy-MM-dd`, `isoMonth` `yyyy-MM`, `day` `dd`, `dayMonth` `dd.MM` |
| MS_IN_SECOND … MS_IN_WEEK | `MS_IN_SECOND`, `MS_IN_MINUTE`, `MS_IN_HOUR`, `MS_IN_DAY`, `MS_IN_WEEK`, `SECONDS_IN_MINUTE`, `SECONDS_IN_HOUR`, `SECONDS_IN_DAY`, `MINUTES_IN_HOUR`, `HOURS_IN_DAY`, `DAYS_IN_WEEK`, `MONTHS_IN_YEAR` |
