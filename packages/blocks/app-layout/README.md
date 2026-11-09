# App layout

The shell of a signed-in app: a sidebar menu, a top bar, the page and a footer. On a desktop the sidebar is a narrow rail of icons that opens over the page while the pointer or the keyboard focus is on it; its pin button keeps it open and moves the page aside. Below 1024px the menu hides behind a button in the top bar and slides in over a mask.

```html
<tx-app-layout title="Reports" logo="/logo.svg" stateKey="app-menu" backdrop [model]="menu">
  <div txAppTopbar>…</div>
  <router-outlet />
  <tx-app-footer txAppFooter variant="app" name="Reports" />
</tx-app-layout>
```

`model` takes `TxPanelMenuItem` sections, as `tx-panel-menu` with `variant="sidebar"` draws them: a section with a `label` gets a title, items take `icon`, `routerLink`, `badge`, `disabled` (a lock), nested `items` and `active`. Without the sidebar (`[sidebar]="false"`) the top bar shows the logo and the title instead — for pages before the user has a workspace.

## Inputs
| Name | Description |
|---|---|
| model | Menu sections (`TxPanelMenuItem[]`) |
| logo | Logo image URL in the sidebar header (and in the top bar without the sidebar) |
| title | App name next to the logo |
| homeLink | Router link of the logo (`/` by default); `undefined` makes it plain text |
| sidebar | `false` drops the sidebar and the menu button and puts the logo into the top bar |
| anchored | Two-way: the sidebar is pinned open (default `true`) |
| stateKey | `localStorage` key that keeps `anchored` between visits |
| backdrop | Draws the soft gradient with a grain behind the page |
| backdropVariant | `spectrum` — primary, purple and cyan tints (default); `accent` — tints of the primary colour only |
| responsive | What the 1024px breakpoint measures: `viewport` — the window (default), `container` — the layout itself; it also keeps the mobile menu, the mask and the backdrop inside it (a preview, a frame) |
| menuLabel | Name of the menu, its button and the sidebar; the translated "Menu" by default |
| dt | Design tokens of this instance (`appLayout`) |
| pt | Classes and styles of the parts: `root`, `sidebar`, `brand`, `menu`, `topbar`, `menuButton`, `content`, `mask` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| anchoredChange | The sidebar was pinned or unpinned |

## Slots
| Name | Description |
|---|---|
| txAppTopbar | The end of the top bar: search, notifications, the user menu |
| default | The page, usually `<router-outlet>` |
| txAppFooter | Under the page, e.g. `tx-app-footer variant="app"` |

## Keyboard
| Key | Action |
|---|---|
| Tab | Into the sidebar: it opens while the keyboard focus is inside (a mouse click does not keep it open) |
| Enter / Space | On the pin button: keeps the sidebar open or lets it fold; on the menu button: opens or closes the mobile menu |
| Escape | Closes the mobile menu, focus goes back to its button |
