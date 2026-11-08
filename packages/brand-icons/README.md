# @tectra-ng/brand-icons

Optional brand logos for `<tx-icon>` and every `[icon]` input, under these names: `android`, `apple`, `discord`, `ethereum`, `facebook`, `github`, `google`, `instagram`, `paypal`, `pinterest`, `reddit`, `telegram`, `tiktok`, `twitch`, `twitter` (the current X logo), `x`, `vimeo`, `whatsapp`, `youtube`.

```ts
provideTxBrandIcons()
```

```html
<tx-icon [name]="'github'" />
<button txButton [icon]="'google'">Sign in with Google</button>
```

Monochrome by default (they take `currentColor`); `TX_BRAND_COLORS` holds each brand colour and `TX_BRAND_TITLES` its official name.

## Source and trademarks

The SVG paths come from [Simple Icons](https://simpleicons.org) (CC0 1.0), regenerated with `node tools/icons/build-brand-icons.mjs`. The logos are trademarks of their owners; using them does not imply endorsement. Follow each brand's own guidelines — most of them only allow the logo to point to that brand (a link to your GitHub, "Sign in with Google").

Not included because their owners asked Simple Icons to remove them: Amazon, LinkedIn, Microsoft, Slack. Take those from the brand's official kit and register them in your app with `provideTxIcons({ linkedin: [...] })`.

## Functions
| Name | Description |
|---|---|
| provideTxBrandIcons | Registers every brand icon in the `TxIconRegistry` — put it into `app.config` |
