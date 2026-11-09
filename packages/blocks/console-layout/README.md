# Console layout

The frame of an "app inside an app" console: a sticky header with the brand and the route crumbs, an icon rail of sections, the page and a footer. An optional left panel (`tx-console-panel`) adds a sticky list or tree next to the page. The console shell only passes data in.

```html
<tx-console-layout
  title="Search"
  titleMuted="console"
  logo="/logo.svg"
  homeLink="/search"
  footerName="Search console"
  documentTitle="Search console"
  [railItems]="sections"
>
  <button txButton txConsoleApps text icon="th-large" aria-label="Apps"></button>
  <div txConsoleActions>…</div>
  <router-outlet />
</tx-console-layout>
```

Crumbs come from the active route chain: every route whose `data` has the `crumbKey` (default `crumb`) adds its string — `{ path: 'projects', data: { crumb: 'Projects' } }`. Pass `crumbs` to set them yourself.

Narrower than 768px the rail becomes a row under the header and only the brand stays in it. By default the console follows the window (`responsive="viewport"`); with `responsive="container"` it follows its own width — for a console in a split view, a preview or any frame narrower than the window. Without anything in `txConsoleApps` the empty cell above the rail goes away and the brand moves to the edge.

```html
<tx-console-panel label="Projects">
  <tx-panel-menu txConsolePanelAside variant="sidebar" [model]="projects" />
  <router-outlet />
</tx-console-panel>
```

The panel goes inside the layout content; it moves the layout footer next to its page. Narrower than 1024px (the window, or the console with `responsive="container"`) the panel folds into a bar above the page: a button with the panel `label` opens the list under it, and it closes again after a link or an item is picked (not a folder that opens), on navigation or on Escape.

## Inputs
| Name | Description |
|---|---|
| title | Required. Brand text next to the logo |
| titleMuted | Muted second word of the brand, e.g. `console` |
| logo | Logo image URL |
| homeLink | Router link of the brand; without it the brand is plain text |
| railItems | Rail sections (`TxConsoleRailItem[]`): `label`, `icon` and `routerLink` (+ `queryParams`, `activeOptions` — `TX_CONSOLE_RAIL_EXACT_MATCH` for the home section, `TX_CONSOLE_RAIL_SECTION_MATCH` for sections), or `url`, or `command` with `active` |
| railLabel | Name of the rail navigation; the translated "Sections" by default |
| crumbKey | Route `data` key whose strings along the active route become the crumbs (default `crumb`) |
| crumbs | Own crumbs instead of the route ones |
| footerName | Name in the footer `© <year> <name>`; empty — no footer |
| footerLinks | Legal links of the footer (`TxAppFooterLink[]`) |
| documentTitle | Browser tab title while the console is open: `<last crumb> · <documentTitle>`; the old title comes back when it closes |
| favicon | Tab icon while the console is open; the old one comes back when it closes |
| translate | Translate function of the shell: crumbs, rail labels and footer labels are keys passed through it |
| responsive | What the 768px / 1024px breakpoints measure: `viewport` — the window (default), `container` — the console itself |
| label | `tx-console-panel`: name of the left panel |
| dt | Design tokens of this instance (`consoleLayout`) |
| pt | Classes and styles of the parts: `root`, `header`, `brand`, `logo`, `crumbs`, `rail`, `content`, `footer`; panel: `root`, `aside`, `toggle`, `nav`, `main`, `content` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txConsoleApps | The cell above the rail, e.g. an app switcher; left out when empty |
| txConsoleActions | The end of the header: search, notifications, user menu |
| default | The page, usually `<router-outlet>` |
| txConsolePanelAside | `tx-console-panel`: one element with the panel content — a link list or a tree |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves through the header, the rail sections and the page in order |
| Enter | On a rail section: opens it; on the folded panel button: opens or closes the list |
| Escape | In the open folded panel: closes it, focus goes back to its button |
