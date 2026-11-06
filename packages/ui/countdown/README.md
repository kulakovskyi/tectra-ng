# Countdown

Counts down to zero — a number of seconds, minutes, hours or days, or the time left to a date — and fires `completed` once at zero. For "redirect in 5 s", "auto-apply in 30 s", "offer ends in 02:14:09" or "3 days left". The `txRemainingTime` pipe formats any remaining milliseconds the same way.

```html
<tx-countdown [value]="5" unit="seconds" suffix="s" (completed)="redirect()" />
<tx-countdown [target]="offerEndsAt" [endingSoon]="60000" />
```

## Inputs
| Name | Description |
|---|---|
| value | Number of `unit`s to count down from; a new value starts again |
| unit | `seconds`, `minutes`, `hours` or `days` |
| target | A date (`Date`, ISO string or ms) to count down to, instead of `value` |
| suffix | Text after the value, e.g. `s` or a translated unit |
| format | `number` — whole units left (default with `value`), `clock` — `mm:ss` or `h:mm:ss` (default with `target`) |
| endingSoon | Milliseconds before zero when the countdown turns to the "ending" colour (`tx-countdown--ending`); `0` never |
| paused | Stops the countdown and keeps the time left; it goes on from there |
| ariaLive | `off` (default — a ticking timer would talk every second), `polite` or `assertive` |
| dt | Design tokens of this instance (`countdown`) |
| pt | Classes and styles of the root |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| completed | Zero was reached; fires once per start |
| tick | The time left in milliseconds, whenever the shown value changes |

## Slots
| Name | Description |
|---|---|
| txCountdownValue | `<ng-template txCountdownValue let-ms let-days="days" let-hours="hours" let-minutes="minutes" let-seconds="seconds" let-expired="expired">` — own display |

## Keyboard
| Key | Action |
|---|---|
| — | Not focusable |

## Notes

- The countdown is a `role="timer"` region. It follows the clock, not the number of ticks, so a background tab or a slow device does not make it drift; it updates only when the shown value changes (every second for `clock`, every unit for `number`).
- `txRemainingTime` (pipe) and `formatRemaining(ms)` give `mm:ss` below an hour and `h:mm:ss` above; `splitRemaining(ms)` gives days, hours, minutes and seconds.
