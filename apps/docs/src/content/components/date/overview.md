---
category: Utilities
source: packages/utils/date
package: @tectra-ng/utils/date
import: TxDatePipe
examples: basic, locale, formats, defaults, time-zone, date-range, calendar-functions
---
# Date

Dates in templates and code. The `txDate` pipe formats in the tectra locale — with `Intl` date styles, or with Angular date patterns — and shows `-` instead of an error for an empty or broken value; the calendar functions work on copies and count calendar days, so daylight saving time does not shift them.

Part of `@tectra-ng/utils` (`npm install @tectra-ng/utils`, also included in `tectra-ng`).
