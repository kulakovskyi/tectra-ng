# HTTP

Helpers around `HttpClient`: query params from a filter object, retries of reads with back-off, and pipes that turn a status code into a kit tone and a translated label.

```ts
this.http.get<Page<Order>>('/api/orders', { params: buildHttpParams(filters) }).pipe(retryHttpReads());
```

```html
<tx-tag [value]="item.status | txHttpStatusLabel" [severity]="item.status | txHttpStatusTone" />
```

## Functions
| Name | Description |
|---|---|
| buildHttpParams(query) | `HttpParams` from an object: skips `null`, `undefined`, `''` and empty arrays, repeats a key for every array item, dates as ISO strings, objects as JSON; `0` and `false` stay |
| retryHttpReads(options?) | RxJS operator for GET requests: retries a network error, 429, 502, 503 and 504 with exponential back-off (2 s, 4 s, 8 s … up to 30 s, 5 times); a `Retry-After` header wins, and when it asks for longer than `maxDelayMs` the error goes through. Options: `count`, `baseDelayMs`, `maxDelayMs`, `statuses` |
| parseRetryAfter(value, now?) | Milliseconds from a `Retry-After` header — seconds or an HTTP date; `null` when missing or broken |
| httpRetryDelay({ error, attempt, baseDelayMs, maxDelayMs }) | The wait before an attempt, or `null` to stop |
| httpStatusGroup(status, warnCodes?) | `ok`, `redirect`, `clientError`, `serverError`, `warning` (codes you list), `noResponse` (no status or 0), `unknown` |
| httpStatusTone(status, warnCodes?) | Kit severity of a status: `success`, `info`, `warn`, `danger`, `secondary` |

## Pipes
| Name | Description |
|---|---|
| txHttpStatusTone: warnCodes? | Severity for `tx-tag`, `tx-status-icon`, `tx-badge` |
| txHttpStatusLabel: warnCodes? | Translated group name: OK, Redirect, Client error, Server error, Warning, No response, Unknown |
| txHttpStatusGroup: warnCodes? | The group as a key, for your own texts |

## Constants
| Name | Description |
|---|---|
| TX_HTTP_RETRYABLE_STATUSES | `0`, `429`, `502`, `503`, `504` |
| TX_HTTP_RETRY_COUNT / TX_HTTP_RETRY_BASE_DELAY_MS / TX_HTTP_RETRY_MAX_DELAY_MS / TX_HTTP_RETRY_FACTOR | `5`, `2000`, `30000`, `2` |
