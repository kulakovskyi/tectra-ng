# Dialog

A window over the page for a task that needs full attention — a form, a confirmation, details. Open a component from code with `TxDialogService`, or write the dialog in a template with `<tx-dialog [(visible)]>`.

```ts
const ref = this.dialogs.open(RenameDialog, { data: { name: project.name }, size: 'small' });
ref.closed.subscribe((name) => name && this.rename(project, name));
```

```ts
@Component({
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose, TxButton, TxInput, FormsModule],
  template: `
    <tx-dialog-header title="Rename project" />
    <tx-dialog-content><input txInput aria-label="Name" [(ngModel)]="name" /></tx-dialog-content>
    <tx-dialog-footer>
      <button txButton severity="secondary" [text]="true" txDialogClose>Cancel</button>
      <button txButton [txDialogClose]="name">Save</button>
    </tx-dialog-footer>
  `,
})
export class RenameDialog {
  name = injectDialogData<{ name: string }>().name;
}
```

`TxDialogService.open(component | template, config)` returns a `TxDialogRef`: `close(result?)` (asks `canClose` first), `closed` (the result, `undefined` when dismissed), `afterOpened`, `componentInstance`, `maximized()`, `toggleMaximize()`, `updateSize(width, height)`. Inside the dialog `injectDialogData<T>()` reads `data` and `injectDialogRef<R>()` gives the ref; `config.inputs` sets component inputs. `closeAll()` and `openDialogs()` cover every open dialog. Config: `data`, `inputs`, `size`, `width`, `minWidth`, `maxWidth`, `height`, `maxHeight`, `breakpoints` (`{ '960px': '90vw' }` — width below a viewport width), `position`, `drawer` / `drawerSize` (see Drawer), `modal`, `closable`, `closeOnEscape`, `dismissableMask`, `blockScroll`, `draggable`, `maximizable`, `autoFocus`, `restoreFocus`, `role`, `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`, `panelClass`, `canClose`, `dt`, `unstyled`, `injector`, `viewContainerRef`.

Layout parts: `<tx-dialog-header title subtitle>` (names the dialog, close and maximize buttons, drag handle), `<tx-dialog-content>` (scrolls), `<tx-dialog-footer>` (actions at the end), `[txDialogTitle]` for an own title element, `[txDialogClose]="result"` on any button.

## Inputs
| Name | Description |
|---|---|
| visible | Two-way open state (`[(visible)]`) |
| header | Title; also names the dialog |
| subtitle | Second line under the title |
| size | `small`, `medium` (default), `large`, `xlarge`, `fullscreen` |
| width | Own width (any CSS length), wins over `size` |
| height | Own height |
| breakpoints | Width per viewport width, e.g. `{ '960px': '90vw' }` |
| position | `center` (default), `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| drawer | Slides in from `left`, `right`, `top` or `bottom` instead (see Drawer) |
| drawerSize | Drawer size: `small`, `medium`, `large`, `full` or a CSS length |
| modal | Dims the page and keeps focus inside (default on) |
| closable | Close button, Escape and a click on the mask close it (default on) |
| closeOnEscape | Overrides `closable` for Escape |
| dismissableMask | Overrides `closable` for a click on the mask |
| blockScroll | Stops the page from scrolling while open (default on, modal only) |
| draggable | The header moves the dialog |
| maximizable | Shows a maximize / restore button |
| autoFocus | `first` focusable field (default; content, then footer, then header), `dialog`, `none` or a CSS selector |
| restoreFocus | Focus goes back to the element that opened it (default on) |
| role | `dialog` or `alertdialog` |
| ariaLabel | Name when there is no header |
| panelClass | Class on the dialog panel |
| canClose | Asked before closing; return `false` (or a promise of it) to keep the dialog open |
| dt | Design tokens of this dialog (`dialog`) |
| unstyled | Removes the tectra styles |
| title | `tx-dialog-header`: title text |
| closeButton | `tx-dialog-header`: shows the close button (default from `closable`) |
| maximizeButton | `tx-dialog-header`: shows the maximize button (default from `maximizable`) |
| txDialogClose | Value the dialog closes with when the element is clicked |

## Outputs
| Name | Description |
|---|---|
| opened | The dialog opened |
| closed | The dialog closed |
| visibleChange | `visible` changed |

## Slots
| Name | Description |
|---|---|
| default | Content of `<tx-dialog>`, placed in a scrolling `tx-dialog-content` |
| tx-dialog-header | Own header instead of `header` |
| tx-dialog-footer | Actions at the bottom |
| txDialogTitle | `<h2 txDialogTitle>` inside `tx-dialog-header` — own title element that names the dialog |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves focus inside the dialog only; it wraps around |
| Escape | Closes the top dialog (when `closable`) |
| Enter / Space | Runs the focused button, e.g. a `txDialogClose` action |
