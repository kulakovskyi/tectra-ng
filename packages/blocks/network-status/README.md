# Network status

A pill at the bottom of the window that says "No internet connection" while the browser is offline, and "Connection restored" for three seconds once it is back. Put it once in the app root.

```html
<tx-network-status />
```

The state lives in the root `TxNetworkService`: it listens to the browser `offline` / `online` events and checks `navigator.onLine` on start — in the browser only, so nothing shows on the server. Read `status` anywhere, or set it from code, e.g. when requests fail although the browser says it is online:

```ts
private readonly network = inject(TxNetworkService);

readonly offline = computed(() => this.network.status() === 'offline');

onRequestFailed(): void {
  this.network.markOffline();
}
```

While the pill is shown the body gets the `bodyClass` class (`tx-offline`), e.g. to dim actions that need the network, and the `--tx-bottom-overlay-offset` variable: the space the pill takes at the bottom of the window. `tx-cookie-notice` moves up by it, and any own bottom overlay can add it to its `bottom`. The pill sits in a polite live region, so screen readers announce both messages.

## Inputs
| Name | Description |
|---|---|
| offlineText | Text while offline (translated "No internet connection" by default) |
| restoredText | Text after the connection is back (translated "Connection restored" by default) |
| restoredDuration | How long "Connection restored" stays, in ms (default 3000) |
| bodyClass | Class on `<body>` while the pill is shown (default `tx-offline`; empty — none) |
| dt | Design tokens of this instance (`networkStatus`) |
| pt | Classes and styles of the parts: `root`, `pill`, `icon`, `text` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| statusChange | The new state: `offline`, `restored` or `online` |

## Methods
| Name | Description |
|---|---|
| onOffline() | Shows the offline pill, as the browser `offline` event does (`TxNetworkService.markOffline()`) |
| onOnline() | Shows "Connection restored", as the browser `online` event does (`TxNetworkService.markOnline()`) |
| status | Signal: `online`, `offline` or `restored` — the `status` of `TxNetworkService` |
| TxNetworkService.status | Signal of the root service: `online`, `offline` or `restored` |
| TxNetworkService.markOffline() | Sets the state to `offline`, e.g. after requests failed |
| TxNetworkService.markOnline() | Sets `restored` when it was `offline`, then `online` after `restoredDuration` |
| TxNetworkService.restoredDuration | Signal: how long `restored` lasts, in ms; the `restoredDuration` input of the pill sets it |
