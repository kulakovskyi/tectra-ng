# Month calendar

A month grid that draws events as continuous bars across days, with day markers, a `+N` link for the events that do not fit and keyboard navigation. Give it events and markers, handle day and event clicks — for schedules, deadlines, shifts or bookings. Below 560px of its own width it turns into a compact grid with coloured dots.

```html
<tx-month-calendar [month]="month()" [events]="events()" [selectedDate]="selected()" (dayClick)="selected.set($event)" (eventClick)="open($event)" />
```

## Inputs
| Name | Description |
|---|---|
| month | Any date inside the month to show; the month of creation by default |
| events | Bars: `{ id, start, end?, title, tone, avatar?, data? }`; `start` / `end` are `Date` or `'yyyy-MM-dd'` (local days), `end` is the inclusive last day; `tone` is `primary`, `info`, `success`, `warn`, `danger` or `neutral`; `avatar` `{ src?, name? }` shows at the start of the bar |
| markers | Pills in a day header (a dot in the compact grid): `{ date, tone, label, icon? }` |
| selectedDate | Highlighted day: a `Date` or `'yyyy-MM-dd'`; it gets the keyboard focus |
| weekStartsOn | First day of the week: 0 Sunday … 6 Saturday; locale default |
| maxLanes | Bar rows per week; the rest goes to the `+N` link of the day |
| labels | Own texts `{ more, today, region }`: `more` with a `{count}` placeholder, `today` added to the name of today, `region` the name of the grid; translated by default |
| locale | BCP 47 locale for weekday names and day names; the kit locale by default |
| today | The day treated as today (the day of creation by default); pass it from a clock if the page stays open over midnight |
| dt | Design tokens of this instance (`monthCalendar`) |
| pt | Classes and styles of the parts: `root`, `grid`, `head`, `weekday`, `week`, `cell`, `day`, `number`, `marker`, `event`, `more` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| dayClick | A day or its `+N` link was clicked; the day `Date` |
| eventClick | A bar was clicked; the event |

## Slots
| Name | Description |
|---|---|
| txMonthCalendarEvent | `<ng-template txMonthCalendarEvent let-event let-segment="segment">` — content of a bar; `segment` has `lane`, `column`, `span`, `startsHere`, `endsHere` |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the selected day (or today, or the first day of the month) |
| Arrow keys | Previous / next day, same day of the previous / next week |
| Enter / Space | Clicks the focused day |

## Accessibility

The month is a `grid` of `gridcell`s with one focusable day (roving focus). Each day is named by its full date, "Today", its markers and its events ("4 events, Sprint, Review…"); the bars and `+N` links are mouse shortcuts hidden from screen readers, so nothing is lost and Enter on a day does what `+N` does. Days of other months and weekend names use the muted text colour, which keeps AA contrast. The selected day has `aria-selected`, today `aria-current="date"`.
