# Message

Inline feedback. `<tx-message>` is a box with a severity, an optional icon and a close button — for notices on a page or inside a form. `<tx-field-hint>` and `<tx-field-error>` sit under a field: a help text, and the first validation error of a form control with built-in texts in every locale.

```html
<tx-message severity="warn" icon="exclamation-triangle" text="The domain is not verified yet" />

<input txInput id="email" [formControl]="email" />
<tx-field-hint for="email">We never share it</tx-field-hint>
<tx-field-error for="email" [control]="email" />
```

Error texts: `messages` on the field, then `provideTectra({ validationMessages })`, then `error.message` of a custom validator, then the built-in text of the locale (`required`, `email`, `minlength`, `maxlength`, `min`, `max`, `pattern`; anything else is "Invalid value"). `{param}` is replaced with the fields of the error object, e.g. `{requiredLength}`, `{min}`.

## Inputs
| Name | Description |
|---|---|
| severity | `tx-message`: `primary`, `secondary`, `success`, `info`, `warn`, `danger`, `help`, `contrast`. `tx-field-hint`: `secondary` or `success` |
| text | `tx-message`: the text; without it the content is shown |
| icon | Icon name (`exclamation-triangle`, also `pi-exclamation-triangle`) or an icon class; no icon by default |
| size | `tx-message`: `small`, `medium`, `large` |
| variant | `tx-message`: tinted box by default, `outlined` without the fill, `text` without the box, `simple` without the box and padding |
| closable | `tx-message`: shows a close button |
| closeIcon | `tx-message`: icon of the close button |
| life | `tx-message`: closes itself after this many milliseconds |
| control | `tx-field-error`: the form control whose errors are shown (`formControl`, a group's control, or `ngModel.control`) |
| errorText | `tx-field-error`: an error from outside the form (e.g. the server) — shown as is, before the control's errors |
| showImmediately | `tx-field-error`: shows the error before the control is touched or changed |
| successText | `tx-field-error`: text shown when the control has a valid value and was touched or changed |
| messages | `tx-field-error`: own texts per error key — a string with `{param}` or a function of the error |
| for | `tx-field-hint`, `tx-field-error`: id of the field; adds this text to its `aria-describedby` |
| id | `tx-field-hint`, `tx-field-error`: own id instead of a generated one |
| dt | Design tokens of this instance (`message` or `fieldMessage`) |
| pt | Classes and styles of the parts: `root`, `icon`, `content`, `closeButton` (message); `root`, `icon`, `text` (hint, error) |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles, keeps behaviour and ARIA |

## Outputs
| Name | Description |
|---|---|
| closed | `tx-message`: closed by the button or after `life` — fires when the leave animation ends, so removing the message here keeps the animation |

## Slots
| Name | Description |
|---|---|
| default | `tx-message`: content when there is no `text`; `tx-field-hint`: the hint |
| txMessageIcon | `<ng-template txMessageIcon>` — own icon |
| txMessageCloseIcon | `<ng-template txMessageCloseIcon>` — own close icon |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the close button |
| Enter / Space | Closes the message from the close button |

## Accessibility

`danger` and `warn` messages have `role="alert"`, the others `role="status"`. `tx-field-error` is a polite live region, so a new error is announced; with `for` the field points to the hint and the error through `aria-describedby`. The field itself turns invalid on its own (`aria-invalid`).
