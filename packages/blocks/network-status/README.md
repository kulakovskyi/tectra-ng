# Network status

A pill at the bottom of the window that says "No internet connection" while the browser is offline, and "Connection restored" for three seconds once it is back. Put it once in the app root.

```html
<tx-network-status />
```

It listens to the browser `offline` / `online` events and checks `navigator.onLine` on start — in the browser only, so nothing shows on the server. While the pill is shown the body gets the `bodyClass` class (`tx-offline`), e.g. to dim actions that need the network. The pill sits in a polite live region, so screen readers announce both messages.

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
| onOffline() | Shows the offline pill, as the browser `offline` event does |
| onOnline() | Shows "Connection restored", as the browser `online` event does |
| status | Signal: `online`, `offline` or `restored` |
