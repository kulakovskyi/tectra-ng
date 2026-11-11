# Gantt Chart

`<tx-gantt-chart>` — tasks as bars on a calendar: groups that fold, progress, milestones, a line for today, a scale from days to quarters with horizontal scrolling and zoom. The `timeline` layout puts all tasks of a group on one lane — bookings, shifts, releases. Built in HTML on the design tokens, rendered on the server.

```ts
import { TxGanttChart } from '@tectra-ng/charts/gantt';
```

```html
<tx-gantt-chart [tasks]="[{ id: 'a', label: 'Design', start: '2026-03-02', end: '2026-03-06', progress: 60 }]" />
```

## Inputs
| Name | Description |
|---|---|
| tasks | `{ id, label, start, end?, group?, progress?, milestone?, color? }[]`; dates are `Date`, timestamps or ISO strings. A date-only `end` (`'2026-03-06'`) includes that day; without `end` a task lasts one day. `milestone: true` draws a diamond at `start`. An empty list shows "No data" |
| layout | `tasks` (default) — a row per task under its group, groups fold; `timeline` — a lane per group with all its tasks |
| zoom | Two-way: `day`, `week` (default), `month` or `quarter` |
| start | First date of the scale; the earliest task minus `padding` by default |
| end | Last date of the scale; the latest task plus `padding` by default |
| padding | Days of air before the first and after the last task (3) |
| today | Date of the today line; the current moment by default, `null` hides it. On first render the chart scrolls so that today is in view |
| barLabels | Task names: `auto` (beside the bar for `tasks`, inside for `timeline`), `outside`, `inside` or `none` |
| toolbar | Shows the zoom buttons and the "Today" button (on by default) |
| maxHeight | Height after which the rows scroll under the sticky header (the `chart.gantt.maxHeight` token by default) |
| labelHeader | Text of the corner over the names; "Task" or "Timeline" by default |
| loading | Shows skeleton rows |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — row and header height, label column, bars, progress, milestones, weekends, today line, folding |
| pt | Classes and styles of the parts: `root`, `toolbar`, `scroll`, `head`, `corner`, `scale`, `row`, `group`, `label`, `lane`, `bar`, `milestone`, `today`, `empty` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the layout and the behaviour |

## Outputs
| Name | Description |
|---|---|
| taskClick | A bar or a milestone was clicked or pressed with Enter / Space: `task`, `start`, `end` (dates, `end` exclusive) |
| groupToggle | A group folded or unfolded: `group`, `collapsed` |
| zoomChange | The zoom changed from the toolbar, the keys or Ctrl + wheel |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the toolbar, the group toggles and then the bars (one tab stop for all bars) |
| ↑ / ↓ | Bar on the previous / next row, the one nearest in time |
| ← / → | Previous / next bar |
| Home / End | First / last bar |
| Enter / Space | Clicks the bar (`taskClick`); on a group toggles it |
| + / − | Zooms in / out |

## Notes

The names stay in a sticky column and the scale in a sticky header while you scroll both ways. Ctrl (⌘ on a Mac) and the wheel zoom at the pointer, keeping the date under it in place; the zoom buttons keep the centre. A group folds and unfolds with a height animation (none under reduced motion); the tasks of a folded group leave the tab order and the arrow keys skip them. A focused bar scrolls into view. Weekends are shaded on the day scale. Each bar has a tooltip and an accessible name with its dates, length and progress.
