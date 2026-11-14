# Title

Browser tab titles from the routes: "Orders · Console". A prefix shows counters or states in front of every title — "(3) Orders · Console" — and a translate function turns title keys into the user's language.

```ts
bootstrapApplication(App, {
  providers: [provideRouter(routes), provideTxTitle({ appName: 'Console', translate: (key) => translations.select(`titles.${key}`) })],
});
```

```ts
export const routes: Routes = [{ path: 'orders', title: 'orders', component: OrdersPage }];

inject(TxTitle).setPrefix(unread ? `(${unread})` : '');
inject(TxTitle).setPage(order.number, { translate: false });
```

## Providers
| Name | Description |
|---|---|
| provideTxTitle({ appName, separator?, translate? }) | Sets the router title strategy: `title` of the route, then the separator (` · `), then the app name; `translate(key)` returns text or an `Observable` of it |

## Methods
| Name | Description |
|---|---|
| TxTitle.setPrefix(prefix) | Text before every title, `''` to remove it |
| TxTitle.setPage(page, { translate? }) | Sets the page part by hand, for a title that is not on a route; `{ translate: false }` shows ready text (a record name) as it is, without the `translate` function |
