# Polling

Asks the server again until a long job is done — an export, an import, a deployment — or refreshes a view on a timer. Waits longer between tries (2 s growing to 15 s by default), pauses while the tab is hidden, retries network hiccups and 429 / 5xx answers, and never runs two requests at once. On the server it makes the first request only and starts no timer.

```ts
poll({
  request: () => this.http.get<Export>(`/api/exports/${id}`),
  isActive: (job) => job.status === 'running',
}).subscribe((job) => this.job.set(job));
```

## Functions
| Name | Description |
|---|---|
| poll({ request, isActive, delay?, maxAttempts?, retry?, skipErrors?, pauseWhenHidden?, initial? }) | Emits every answer while `isActive(answer)` is true, then completes. `delay` — ms or `{ startMs, factor, maxMs }` (`TX_POLL_DEFAULT_DELAY`); `retry` — options of `retryHttpReads` or `false`; `skipErrors` keeps polling after a failed try; `initial` — a value you already have, so the first request waits for the delay |
| refreshEvery({ request, delay, when?, immediate?, pauseWhenHidden?, skipErrors? }) | Runs `request` every `delay` ms while `when()` is true, skipping a tick while the previous request still runs; errors are skipped by default |
| pollDelay(delay, attempt) | The wait before an attempt |
| isPageHidden() / waitUntilVisible() | Tab visibility helpers |
| toPollingError(error) | `{ status, message }` from an `HttpErrorResponse` (`message` from `error.error` or `error.message` of the body) |

## Methods
| Name | Description |
|---|---|
| new TxPoller(config) | A poller with state for a page: `config` is the `poll` options with `request({ params, attempt })` |
| isLoading / isPolling / error | Signals: waiting for the first answer, polling, the last error (`TxPollingError`) |
| watch(params) | Starts polling for these params (stops the previous run); subscribe to get the answers |
| restart() | Polls again from the first request with the same params |
| stop() | Stops and clears the error |

## Constants
| Name | Description |
|---|---|
| TX_POLL_DEFAULT_DELAY | `{ startMs: 2000, factor: 1.5, maxMs: 15000 }` |
| TX_POLL_SLOW_DELAY | `{ startMs: 5000, factor: 1.5, maxMs: 30000 }` |
