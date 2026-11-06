# Date picker

A date field with a calendar panel — one date, several dates or a range, with or without time, typed or picked, in a popup, a touch dialog or inline. Works with `formControl`, `ngModel` and signal forms.

```html
<tx-datepicker [formControl]="period" selectionMode="range" dateFormat="dd.mm.yy" [showIcon]="true" [showClear]="true" placeholder="Period" />
```

## Inputs
| Name | Description |
|---|---|
| selectionMode | `single`, `multiple` or `range` (the value is `[start, end]`, `end` is `null` until picked; while the end is not picked, the days up to the hovered or focused day are highlighted) |
| dateFormat | Format of the field: `d` / `dd` day, `o` / `oo` day of the year, `D` / `DD` weekday name, `m` / `mm` month, `M` / `MM` month name, `y` / `yy` year, `@` Unix ms, `!` ticks, `'text'` literal; locale default (`mm/dd/yy` us, `dd.mm.yy` ua) |
| placeholder | Text of the empty field |
| inputId | Id of the input, for an outside `<label for>` |
| name | Name of the input |
| ariaLabel | Accessible name of the field and the panel |
| ariaLabelledBy | Id of the element that names the field |
| iconAriaLabel | Accessible name of the icon button; "Choose date" by default |
| inline | Shows the calendar in place, without a field |
| showIcon | Shows the calendar icon |
| iconDisplay | `button` — a button joined to the field, `input` — an icon inside the field |
| icon | Icon name |
| showClear | Shows a clear button in the field when it has a value |
| showButtonBar | Today and Clear buttons under the calendar |
| showOtherMonths | Shows days of the previous / next month |
| selectOtherMonths | Lets those days be picked; on by default (off in PrimeNG) |
| showWeek | Week numbers (ISO) |
| startWeekFromFirstDayOfYear | Counts week 1 from January 1 |
| showTime | Hours and minutes under the calendar |
| timeOnly | Only the time picker |
| hourFormat | `24` or `12` (with AM / PM) |
| showSeconds | Seconds in the time picker |
| stepHour | Hours per click |
| stepMinute | Minutes per click |
| stepSecond | Seconds per click |
| timeSeparator | Between hours, minutes and seconds; `:` by default |
| view | `date`, `month` (pick a month) or `year` (pick a year) |
| numberOfMonths | Months side by side |
| responsiveOptions | `[{ breakpoint: '768px', numberOfMonths: 1 }]` — fewer months on narrow screens |
| firstDayOfWeek | 0 Sunday … 6 Saturday; locale default |
| minDate | Earliest date |
| maxDate | Latest date |
| disabledDates | Dates that cannot be picked |
| disabledDays | Weekdays that cannot be picked (0 Sunday … 6 Saturday) |
| maxDateCount | Most dates in `multiple` mode |
| defaultDate | Month shown and time used while there is no value |
| readonlyInput | The field takes no typing, only the calendar |
| keepInvalid | Keeps text that is not a valid date after blur |
| hideOnDateTimeSelect | Closes the panel once the date (or the range end) is picked; not with time |
| showOnFocus | Opens the panel when the field gets focus or a click |
| touchUI | Opens the calendar as a centred dialog with a mask, for touch screens |
| dataType | `date` — `Date` values, `string` — strings in `dateFormat` |
| multipleSeparator | Between dates in `multiple` mode; `,` |
| rangeSeparator | Between the start and the end; `-` |
| shortYearCutoff | Two-digit years up to this one are this century (`+10` = ten years ahead) |
| size | `small`, `medium` or `large` |
| variant | `outlined` or `filled` |
| fluid | Takes the full width (also inside `<tx-fluid>`) |
| invalid | Marks the field invalid; also taken from the form control |
| disabled | Disables the field |
| readonly | Shows the value without changes |
| required | Sets `required` on the input |
| dt | Design tokens of this instance (`datePicker`) |
| pt | Classes and styles of the parts: `root`, `input`, `dropdown`, `inputIcon`, `clear`, `panel`, `header`, `title`, `previous`, `next`, `selectMonth`, `selectYear`, `calendar`, `table`, `weekday`, `weekNumber`, `day`, `monthView`, `month`, `yearView`, `year`, `timePicker`, `buttonbar` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| selected | A date was picked in the calendar |
| cleared | The value was cleared |
| todayClicked | The Today button was clicked |
| clearClicked | The Clear button was clicked |
| monthChange | The calendar moved to another month: `{ month, year }` (month 1–12) |
| yearChange | The calendar moved to another year |
| opened | The panel opened |
| closed | The panel closed |
| focused | The field got focus |
| blurred | The field lost focus |
| typed | The text in the field changed |

## Slots
| Name | Description |
|---|---|
| txDatePickerDate | `<ng-template txDatePickerDate let-day let-selected="selected">` — content of a day: `day`, `month`, `year`, `today`, `otherMonth`, `selectable` |
| txDatePickerHeader | `<ng-template txDatePickerHeader>` — content above the calendar |
| txDatePickerFooter | `<ng-template txDatePickerFooter>` — content under the calendar |
| txDatePickerDecade | `<ng-template txDatePickerDecade let-years>` — title of the year view |
| txDatePickerButtonBar | `<ng-template txDatePickerButtonBar let-today="today" let-clear="clear">` — own button bar |
| txDatePickerTriggerIcon | `<ng-template txDatePickerTriggerIcon>` — content of the icon button |
| txDatePickerInputIcon | `<ng-template txDatePickerInputIcon let-toggle>` — icon inside the field |

## Keyboard
| Key | Action |
|---|---|
| ArrowDown / Alt + ArrowDown | Field — opens the panel and moves focus to the date |
| Enter | Field — applies the typed text and closes the panel |
| Escape | Closes the panel and returns to the field |
| Tab | Field — applies the text, closes the panel and moves on; panel — moves between its buttons and the grid (focus stays in the panel) |
| Arrow keys | Grid — previous / next day or week; month and year views — previous / next item or row |
| Home / End | First / last day of the week |
| PageUp / PageDown | Previous / next month; with Shift — year |
| Enter / Space | Picks the focused day, month or year |

## Accessibility

The field is a `combobox` with `aria-haspopup="dialog"`; the panel is a `dialog` (`aria-modal`) with a focus trap, or a `group` when inline. Days are a `grid` with one focusable cell (roving focus), full date names, `aria-selected` for the picked dates and the range, `aria-disabled`, `aria-current="date"` for today. A picked date is announced. Previous / next, month, year and time buttons are labelled in the current locale.
