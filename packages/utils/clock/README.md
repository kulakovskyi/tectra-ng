# Clock

One shared clock for the app: a `now` signal that ticks every second in the browser (no timer on the server, so prerendering stays fast), countdowns to a date as signals, and a check whether a date is still ahead. Everything that reads `now` updates together — times, countdowns, "5 minutes ago".

```ts
private clock = inject(TxClock);

readonly offer = this.clock.countdown(() => this.deal().endsAt, 10 * 60_000);
```

```html
{{ offer.remainingMs() | txRemainingTime }}   <!-- txRemainingTime from @tectra-ng/ui/countdown -->
{{ comment.createdAt | txRelativeTime: { now: clock.now() } }}
```

## Methods
| Name | Description |
|---|---|
| now | Signal of `Date.now()`, updated every second in the browser |
| countdown(target, endingSoonMs?) | Signals `remainingMs`, `isExpired` (the target passed) and `isEndingSoon` (less than `endingSoonMs` left) for a date or a signal of one |
| isInFuture(value) | The date is later than `now()` |
