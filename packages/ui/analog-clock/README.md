# Analog clock

A clock face with hour and minute hands (and an optional second hand) that shows the time of an IANA time zone — for "local time of the client / office" blocks. The `txAnalogClockHands` pipe gives the same time as `HH:mm` and the hand angles for an own display.

```html
<tx-analog-clock timezone="Europe/Kyiv" ariaLabel="Kyiv office" />
```

## Inputs
| Name | Description |
|---|---|
| timezone | IANA time zone such as `Europe/Kyiv`; empty or unknown is the local time |
| time | A fixed time (`Date` or ms) instead of the running clock |
| showSeconds | Adds a second hand; the clock then updates every second instead of every minute |
| ariaLabel | Text before the time in the accessible name, e.g. the city |
| dt | Design tokens of this instance (`analogClock`) |
| pt | Classes and styles of the parts: `root`, `face`, `tick`, `hourHand`, `minuteHand`, `secondHand`, `pin` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Keyboard
| Key | Action |
|---|---|
| — | Not focusable |

## Notes

- The face is `role="img"` named by the time (`14:30`, after `ariaLabel` when set).
- Hands turn with a soft spring and always forward — from :59 to :00 they go on, not back around the face; with reduced motion they jump.
- The clock updates at the start of each minute (or second), so it stays exact without polling.
- `txAnalogClockHands` (pipe) and `clockHands(ms, timezone)` return `{ time, hourAngle, minuteAngle, secondAngle }`.
