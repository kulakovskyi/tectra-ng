# Gantt Chart

`<tx-gantt-chart>` — tasks as bars on a calendar: groups that fold, progress, milestones, dependency arrows, a line for today, a scale from days to quarters with horizontal scrolling and zoom. The `timeline` layout puts all tasks of a group on one lane — bookings, shifts, releases. Built in HTML on the design tokens, rendered on the server.

```ts
import { TxGanttChart } from '@tectra-ng/charts/gantt';
```

```html
<tx-gantt-chart [tasks]="[{ id: 'a', label: 'Design', start: '2026-03-02', end: '2026-03-06', progress: 60 }]" />
```

## Inputs
| Name | Description |
|---|---|
| tasks | `{ id, label, start, end?, group?, progress?, milestone?, color?, dependsOn? }[]`; dates are `Date`, timestamps or ISO strings. A date-only `end` (`'2026-03-06'`) includes that day; without `end` a task lasts one day. `milestone: true` draws a diamond at `start`. `dependsOn` lists the tasks it waits for: ids (finish-to-start) or `{ id, type }` with `finish-to-start`, `start-to-start`, `finish-to-finish` or `start-to-finish`; unknown ids, self links and links that close a cycle are left out. An empty list shows "No data" |
| layout | `tasks` (default) — a row per task under its group, groups fold; `timeline` — a lane per group with all its tasks; overlapping tasks of a lane get their own sub-rows |
| zoom | Two-way: `day`, `week` (default), `month` or `quarter` |
| start | First date of the scale; the earliest task minus `padding` by default |
| end | Last date of the scale; the latest task plus `padding` by default. The scale always runs to the end of a whole header cell and, when the range is short, on to the edge of the chart |
| padding | Days of air before the first and after the last task (3) |
| today | Date of the today line; the current moment by default, `null` hides it. On first render the chart scrolls so that today is in view |
| barLabels | Task names: `auto` (beside the bar for `tasks`, inside for `timeline`), `outside`, `inside` or `none`; a name whose bar starts left of the view sticks to its left edge |
| showDependencies | Draws the `dependsOn` arrows between the bars (on by default) |
| dependencyHighlight | Hovering or focusing a task lights up its dependency chain — everything it waits for and everything that waits for it — and dims the rest (on by default) |
| toolbar | Shows the zoom buttons and the "Today" button (on by default) |
| maxHeight | Height after which the rows scroll under the sticky header (the `chart.gantt.maxHeight` token by default) |
| labelHeader | Text of the corner over the names; "Task" or "Timeline" by default |
| loading | Shows skeleton rows |
| ariaLabel | What the chart shows; starts the summary read by screen readers |
| dt | Design tokens of this chart (`chart`) — row and header height, label column, bars, progress, milestones, dependency arrows, dimming, weekends, today line, folding |
| pt | Classes and styles of the parts: `root`, `toolbar`, `scroll`, `head`, `corner`, `scale`, `row`, `group`, `label`, `lane`, `bar`, `milestone`, `dependency`, `today`, `empty` |
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

The names stay in a sticky column and the scale in a sticky header while you scroll both ways. Ctrl (⌘ on a Mac) and the wheel zoom at the pointer, keeping the date under it in place; the zoom buttons keep the centre. A group folds and unfolds with a height animation (none under reduced motion); the tasks of a folded group leave the tab order and the arrow keys skip them. A focused bar scrolls into view. Weekends are shaded on the day scale. Each bar has a tooltip and an accessible name with its dates, length, progress and dependencies ("Depends on: …", "Required by: …").

Dependency arrows are orthogonal: a short stub out of the predecessor's edge (its end for `finish-…`, its start for `start-…`), a vertical run and a stub with an arrowhead into the successor's start or end; a milestone links from the tips of its diamond. A name beside a bar moves aside for an arrow on that edge. Among the possible routes the chart takes the one that crosses the fewest other bars and names, and when the successor starts before the stub of the predecessor ends the arrow goes around through the gap between the rows. Arrows sit over the grid and under the bars and names. In a folded group the arrows of its tasks move to the summary bar, arrows between two tasks of the same folded group are hidden, and arrows that meet on the same ends are drawn once. The tokens `gantt.dependencyColor`, `dependencyWidth`, `dependencyActiveColor`, `dependencyActiveWidth` and `dimmedOpacity` style them; the highlight fades with the hover duration and without motion under reduced motion.
