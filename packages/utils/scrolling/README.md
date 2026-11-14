# Scrolling

Router scrolling for list pages: back and forward restore the saved position, a new path starts at the top, and navigations that only change the query string — paging, sorting, filters written by `txFilterState({ url: true })` — leave the page where it is. Links with a fragment are left to the router's anchor scrolling.

```ts
bootstrapApplication(App, {
  providers: [provideRouter(routes), provideTxScrolling()],
});
```

Use it instead of the router's own restoration: keep `scrollPositionRestoration` at `'disabled'` (the default; with `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' | 'top' })` every query change scrolls to the top). `withInMemoryScrolling({ anchorScrolling: 'enabled' })` can stay for fragments. Nothing runs on the server.

## Providers
| Name | Description |
|---|---|
| provideTxScrolling() | Sets the scrolling up next to `provideRouter`: restores the position on back / forward, scrolls to the top when the path changes, does nothing on query-only navigations and leaves fragments to the router |
