# Form Validation

Shows the user what is wrong after a failed save: every control becomes touched and dirty (so the kit fields show their errors), the first invalid field scrolls into the middle of the screen and gets the focus — the inner input of a kit field (select, datepicker, multiselect …), not its wrapper. Smooth scrolling turns instant with reduced motion.

```ts
private validation = inject(TxFormValidation);

save(): void {
  if (this.form.invalid) {
    this.validation.scrollToFirstInvalid(this.form);
    return;
  }
}
```

Or let the form do it on submit: `<form [formGroup]="form" txScrollToInvalid (validSubmit)="save()">`.

## Inputs
| Name | Description |
|---|---|
| focus | `txScrollToInvalid`: focus the field after scrolling |
| block | `txScrollToInvalid`: where the field lands — `center`, `start`, `end`, `nearest` |

## Outputs
| Name | Description |
|---|---|
| validSubmit | `txScrollToInvalid`: the form was submitted and is valid |
| invalidSubmit | `txScrollToInvalid`: the form was submitted invalid; the first error is in view |

## Methods
| Name | Description |
|---|---|
| scrollToFirstInvalid(form, options?) | `TxFormValidation`: marks all touched, scrolls to and focuses the first invalid field; `{ scope, focus, block }`; returns `true` when a field was found. Provide it in a component to search only inside it |

## Functions
| Name | Description |
|---|---|
| markAllTouched(control) | Touched and dirty for a control and every control inside groups and arrays |
| firstInvalidElement(scope) | The first element with `ng-invalid` that has no invalid element inside |
| focusTarget(element) | The element itself when it takes focus, or the first focusable element inside |
