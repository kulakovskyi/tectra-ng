# KeyFilter

Lets only allowed characters into an `input` or `textarea`: blocks typing, cleans pasted and dropped text. With `validateOnly` it does not block anything and reports a `keyFilter` error to the form instead.

| Preset | Allows |
|---|---|
| `pint` | digits |
| `int` | digits and `-` |
| `pnum` | digits and `.` |
| `num` | digits, `.` and `-` |
| `money` | digits, `.`, `,` and spaces |
| `hex` | `0-9`, `a-f` |
| `email` | letters, digits, `_ . - @` |
| `alpha` | letters and `_` |
| `alphanum` | letters, digits and `_` |
| `latin` | Latin letters only (+ `keyFilterExtra`) |
| `positive` | digits and one decimal separator (`.` or `,`) |
| `nospace` | anything but whitespace |

## Inputs
| Name | Description |
|---|---|
| txKeyFilter | A preset name or a `RegExp` that one character must match |
| keyFilterExtra | Extra characters allowed on top of the preset, e.g. `'-_ '` |
| validateOnly | Do not block input; add a `keyFilter` error to the form control when the value has other characters |

## Keyboard
| Key | Action |
|---|---|
| Typing | Characters outside the filter are ignored |
| Paste / drop | The text is inserted without the characters outside the filter |
