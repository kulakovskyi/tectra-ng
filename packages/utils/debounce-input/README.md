# Debounce Input

Waits until the user stops typing before it reports the value — search fields, filters, live validation. Put it on an input, a textarea or any element with a field inside (`tx-icon-field`, a kit field): it listens to the `input` events that bubble up. Enter reports at once.

```html
<input txInput txDebounceInput [debounceTime]="400" (debounceValue)="search($event)" aria-label="Search" />
```

## Inputs
| Name | Description |
|---|---|
| debounceTime | Pause in ms after the last keystroke |
| distinct | Skips a value equal to the last reported one (Enter still reports) |
| minLength | Reports only from this many characters; an emptied field is always reported |

## Outputs
| Name | Description |
|---|---|
| debounceInput | The last `input` event (or the Enter `keydown`) after the pause |
| debounceValue | The text of the field after the pause |

## Methods
| Name | Description |
|---|---|
| flush() | Reports the pending value now (`exportAs: 'txDebounceInput'`) |
| cancel() | Drops the pending value |

## Keyboard
| Key | Action |
|---|---|
| Enter | Reports the current value at once |
