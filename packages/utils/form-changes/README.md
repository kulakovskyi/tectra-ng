# Form Changes

Knows whether a form differs from what was loaded — to enable Save, warn before leaving, or put the values back. Compares deeply (groups, arrays, dates by time, disabled controls too), and treats `null`, `undefined` and `''` as the same empty value.

```ts
readonly changes = trackFormChanges(this.form);
```

```html
<button txButton label="Save" [disabled]="!changes.changed()" (click)="save()"></button>
```

## Functions
| Name | Description |
|---|---|
| trackFormChanges(form) | In an injection context: `{ changed, commit(), revert() }` — a signal, take the current values as the new start, put the start values back |
| deepEqual(a, b) | The comparison it uses |

## Methods
| Name | Description |
|---|---|
| TxFormChangeTracker.initFormTracking(form) | Remembers the current values (provide the service in the component) |
| hasFormChanges(form) | `true` when the values differ from the remembered ones |
| updateInitialFormState(form) | Remembers the values again — after a save |
| resetFormToInitial(form) | Puts the remembered values back |
| resetFormTracking() | Forgets them |
