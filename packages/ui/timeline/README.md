# Timeline

Shows events in order along a line — an order history, a release log, the steps of a process — vertically or horizontally, with content on one side, on both sides or alternating.

```html
<tx-timeline [value]="events" ariaLabel="Order history">
  <ng-template txTimelineContent let-event>{{ event.status }}</ng-template>
  <ng-template txTimelineOpposite let-event>{{ event.date }}</ng-template>
</tx-timeline>
```

## Inputs
| Name | Description |
|---|---|
| value | Events, one list item each |
| layout | `vertical` or `horizontal` |
| align | Vertical: content on the `left` (default), `right` or `alternate`. Horizontal: line at the `top` (default), `bottom` or `alternate` |
| ariaLabel | Accessible name of the list |
| ariaLabelledBy | Id of the element that names the list |
| dt | Design tokens of this instance (`timeline`) |
| pt | Classes and styles of the parts: `root`, `list`, `event`, `eventOpposite`, `eventSeparator`, `eventMarker`, `eventConnector`, `eventContent` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txTimelineContent | `<ng-template txTimelineContent let-event let-index="index">` — content of an event |
| txTimelineOpposite | `<ng-template txTimelineOpposite let-event>` — content on the other side of the line, e.g. the date |
| txTimelineMarker | `<ng-template txTimelineMarker let-event>` — own marker, e.g. an icon in a tinted circle |
| txTimelineConnector | `<ng-template txTimelineConnector let-event>` — own line to the next event; the last event has none |

Every template gets the event as `$implicit` plus `index`, `first` and `last`.

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through links and buttons inside the events; the timeline itself takes no focus |

## Accessibility

The events are an ordered list (`<ol>` / `<li>`), so screen readers announce their number and position. Markers and connectors are decorative (`aria-hidden`). Name the list with `ariaLabel` or `ariaLabelledBy`.
