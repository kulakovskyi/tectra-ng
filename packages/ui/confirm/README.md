# Confirm

Asks the user to confirm an action before it happens — delete, archive, revoke, leave. `TxConfirmService.dialog()` asks in a small alert dialog, `popup()` right next to the button; both resolve to `true` or `false`.

```ts
private confirm = inject(TxConfirmService);

async remove(file: StoredFile): Promise<void> {
  const ok = await this.confirm.dialog({
    title: `Delete “${file.name}”?`,
    message: 'The file and its history will be gone.',
    severity: 'danger',
  });
  if (ok) {
    this.files.remove(file);
  }
}
```

```html
<button txButton icon="trash" (click)="confirm.popup($event, { message: 'Remove this member?', severity: 'danger', acceptLabel: 'Remove' })"></button>
```

An `accept` function runs before the answer: the accept button shows a spinner, the dialog cannot be dismissed meanwhile, and when the promise rejects the dialog stays open so the user can try again.

## Options
| Name | Description |
|---|---|
| title | Question in bold; "Are you sure?" by default (translated) |
| message | Details under it; also describes the dialog |
| severity | `primary` (default), `info`, `success`, `warn`, `danger` — colour of the icon and the accept button |
| icon | Own icon name, or `false` for none; by default it follows the severity |
| acceptLabel | Text of the accept button; "Confirm", or "Delete" for `danger` (translated) |
| rejectLabel | Text of the reject button; "Cancel" (translated) |
| acceptIcon | Icon on the accept button; a trash can for `danger` |
| defaultFocus | `reject` (default — the safe choice) or `accept` |
| accept | Runs on accept; may return a promise — the button waits, a rejection keeps the dialog open |
| placement | Popup only: one of the 12 placements, `bottom` by default |
| dt | Design tokens (`confirm`) |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves between the two buttons; focus stays inside |
| Enter / Space | Runs the focused button |
| Escape | Answers `false` |
