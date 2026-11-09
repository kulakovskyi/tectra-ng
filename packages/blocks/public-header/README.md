# Public header

The sticky header of public pages — a landing, pricing, docs, sign-in: the brand, the links, the language and theme preferences and the actions, on a translucent blurred bar. Below 768px the links, the preferences and the actions fold into a panel behind a burger.

```html
<tx-public-header brand="Northwind" logo="/logo.svg">
  <nav txPublicHeaderNav aria-label="Main">
    <a routerLink="/features">Features</a>
    <a routerLink="/pricing">Pricing</a>
  </nav>
  <div txPublicHeaderActions>
    <a txButton severity="secondary" text routerLink="/sign-in">Sign in</a>
    <a txButton routerLink="/sign-up">Get started</a>
  </div>
</tx-public-header>
```

The panel closes on a link or a button inside, on Escape (the focus goes back to the burger) and when the page grows past the breakpoint. In the panel the preferences turn into labelled rows and the actions take the full width.

## Inputs
| Name | Description |
|---|---|
| brand | Required. Name next to the logo; the brand links to `homeLink` |
| logo | Logo image URL; left out when empty |
| homeLink | Where the brand leads: router commands or a path (default `/`); a plain link without the router |
| preferences | Shows the language and theme preferences (default on) |
| responsive | `viewport` (default) — the burger follows the window width; `container` — the header's own width, for previews |
| dt | Design tokens of this instance (`publicHeader`) |
| pt | Classes and styles of the parts: `root`, `bar`, `brand`, `logo`, `panel`, `nav`, `end`, `actions`, `toggle` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txPublicHeaderBrand | `<span txPublicHeaderBrand>` — own brand content (an animated logo, a wordmark) instead of `logo` and the `brand` text; `brand` stays the link's accessible name |
| txPublicHeaderNav | `<nav txPublicHeaderNav>` — the links; direct `a` children get the link look |
| txPublicHeaderActions | `<div txPublicHeaderActions>` — buttons at the end, e.g. sign in and sign up |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the burger: opens or closes the panel |
| Escape | Closes the panel and returns the focus to the burger |
| Tab | Moves through the brand, the links, the preferences and the actions |
