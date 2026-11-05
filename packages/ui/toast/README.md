# Toast

Short messages about what just happened — saved, failed, exported — that appear in a corner and go away on their own. Put one `<tx-toast />` in the app shell and send toasts from anywhere with `TxToastService`.

```html
<!-- app.component.html -->
<router-outlet />
<tx-toast position="bottom-center" />
```

```ts
private toast = inject(TxToastService);

save(): void {
  this.toast.success('Changes saved');
}

export(): void {
  const progress = this.toast.loading('Exporting 1 240 rows…');
  this.api.export().subscribe({
    next: () => progress.update({ severity: 'success', text: 'Export is ready', actions: [{ label: 'Download', run: () => this.download() }] }),
    error: () => progress.update({ severity: 'danger', text: 'Export failed' }),
  });
}
```

`TxToastService`: `show(options)`, `success(text, options?)`, `info`, `warn`, `error`, `loading` return a `TxToastRef` (`close()`, `update(options)`, `closed` with the reason `timeout`, `close`, `action`, `api` or `clear`); `clear(key?)` closes all toasts or those of one key; `toasts` is a signal of the shown toasts. Options: `severity`, `title`, `text`, `icon` (`false` for none), `life` (ms, default 5000), `sticky`, `closable`, `showProgress`, `actions` (`{ label, run?, severity?, keepOpen? }`), `template`, `data`, `key`, `loading`. A loading toast is sticky and not closable until it is updated with a severity. App-wide defaults: `provideTxToast({ life: 8000 })`.

The time stops while the pointer is over a toast or focus is inside it. Every toast is announced to screen readers (errors and warnings at once, the rest politely) without moving focus; its buttons are reachable with Tab inside the "Notifications" region.

## Inputs
| Name | Description |
|---|---|
| position | `top-left`, `top-center`, `top-right` (default), `bottom-left`, `bottom-center`, `bottom-right` |
| key | Shows only toasts sent with this key; without a key — toasts without one |
| max | How many toasts are shown at once (default 5); older ones wait |
| inPlace | Keeps the outlet where it is written; by default it moves to the end of `body` so headers and scrolling containers cannot cover it |
| dt | Design tokens of this outlet (`toast`) |
| pt | Classes and styles of the parts: `root`, `item`, `icon`, `body`, `title`, `text`, `actions`, `closeButton`, `progress` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txToastTemplate | `<ng-template txToastTemplate let-toast let-close="close">` — own content of every toast in this outlet (or `template` per toast) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Reaches the actions and the close button of each toast; focus inside pauses it |
| Enter / Space | Runs the focused action or closes the toast |
