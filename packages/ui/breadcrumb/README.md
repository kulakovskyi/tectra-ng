# Breadcrumb

Shows where the current page sits in the hierarchy: a row of links to the parent pages, ending with the current page. Items come from a `model` array and can be router links, URLs or commands.

```html
<tx-breadcrumb [home]="home" [model]="items" />
```

```ts
home: TxBreadcrumbItem = { icon: 'home', routerLink: '/', ariaLabel: 'Home' };
items: TxBreadcrumbItem[] = [{ label: 'Projects', routerLink: '/projects' }, { label: 'Website' }];
```

## Inputs
| Name | Description |
|---|---|
| model | The items, `TxBreadcrumbItem[]`; the last one is the current page |
| home | First item, usually a home icon |
| separator | `chevron` (default) or `slash` |
| ariaLabel | Label of the navigation landmark ("Breadcrumb" by default, translated) |
| dt | Design tokens of this instance (`breadcrumb`) |
| pt | Classes and styles of the parts: `root`, `list`, `item`, `link` (links, commands, the current page and disabled items), `text` (an item without a link or command), `icon`, `label`, `separator` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemClick | An item link or command was clicked: `{ originalEvent, item }` |

## Slots
| Name | Description |
|---|---|
| txBreadcrumbItem | `<ng-template txBreadcrumbItem let-item let-current="current">` — own content of an item (the link stays) |
| txBreadcrumbSeparator | `<ng-template txBreadcrumbSeparator>` — own separator |

## Item
| Field | Description |
|---|---|
| label | Text |
| icon | Icon name (or a CSS class) before the label |
| routerLink, queryParams, fragment | Router navigation |
| url, target | Plain link |
| command | Called with `{ originalEvent, item }` on click; an item with only a command is a button |
| disabled | Shown dimmed, not clickable |
| title, ariaLabel, id | Tooltip, accessible name (needed for an icon-only item), element id |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through the links; the current page and disabled items are not focusable |
| Enter | Follows the focused link |
| Enter / Space | Runs the command of a command item |

## Accessibility

A `nav` landmark with a label, an ordered list of items, separators hidden from screen readers and `aria-current="page"` on the last item.
