# Virtual scroller

Renders only the items that fit in its scroll area, so lists of thousands of items scroll smoothly. Works vertically, horizontally or in both directions (a grid of rows and columns), loads ranges lazily from a server, shows loaders and scrolls to any index. Items have a fixed size.

## Inputs
| Name | Description |
|---|---|
| items | Items to render; for `both` an array of rows, each an array of cells. Missing items (`undefined`) show the loader template |
| itemSize | Size of one item in px; for `both` `[rowHeight, columnWidth]` |
| scrollHeight | Height of the scroll area, e.g. `300px` |
| scrollWidth | Width of the scroll area |
| orientation | `vertical`, `horizontal` or `both` |
| numToleratedItems | Items rendered beyond each edge of the viewport (half a viewport by default) |
| delay | Waits this many ms after scrolling stops before rendering the new range |
| step | With `lazy`, ranges are asked in chunks of this many items |
| lazy | Emits `lazyLoad` with every new range |
| appendOnly | Keeps the items already rendered, only adds new ones |
| disabled | Renders every item without virtualization |
| showSpacer | Keeps the full scroll size with a spacer |
| showLoader | Shows loaders while `loading` is on or while a `delay` runs |
| loading | Loading state; with `showLoader` shows the loader template or a mask with a spinner |
| loadingIcon | Icon of the loading mask |
| trackBy | `(index, item) => key` for rendering; the index by default |
| tabindex | Tab index of the scroll area so it scrolls with the keyboard |
| ariaLabel | Accessible name; the scroll area becomes a region |
| ariaLabelledBy | Id of the element that labels the scroll area |
| dt | Design tokens of this instance (`virtualScroller`) |
| pt | Classes and styles of the parts: `root`, `spacer`, `content`, `item`, `row`, `loader`, `loadingIcon` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| lazyLoad | A new range should be loaded: `{ first, last }` |
| scrolled | The area was scrolled: `{ originalEvent }` |
| scrollIndexChange | The visible range changed: `{ first, last }` |

## Slots
| Name | Description |
|---|---|
| txVirtualScrollerItem | `<ng-template txVirtualScrollerItem let-item let-index="index">` — one item; context also has `count`, `first`, `last`, `even`, `odd` |
| txVirtualScrollerLoader | `<ng-template txVirtualScrollerLoader let-index>` — placeholder of a missing or loading item |
| txVirtualScrollerLoadingIcon | `<ng-template txVirtualScrollerLoadingIcon>` — own icon of the loading mask |
| txVirtualScrollerContent | `<ng-template txVirtualScrollerContent let-items let-first="first">` — renders the whole range yourself (rows of a table, for example) |

## Methods
| Name | Description |
|---|---|
| scrollToIndex(index, behavior?) | Scrolls so the item is first; `[row, column]` for `both` |
| scrollInView(index, 'to-start' \| 'to-end', behavior?) | Scrolls the item to the start or the end of the viewport |
| scrollTo(options) | Native `scrollTo` |
| getRenderedRange() | `{ first, last, viewport: { first, last } }` |
| refresh() | Measures the viewport again |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the scroll area |
| Arrow keys, Page Up / Page Down, Home / End, Space | Scroll natively |
