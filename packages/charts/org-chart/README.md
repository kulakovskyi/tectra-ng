# Org Chart

`<tx-org-chart>` — a hierarchy as a tree of cards on a pan and zoom canvas: drag to move, wheel or pinch to zoom at the cursor, trackpad scroll to pan; a toolbar with search, zoom − / % / +, fit, expand / collapse all and full screen (with an overlay fallback), a minimap with click and drag navigation, hotkeys, the path to the root on hover, focus on a found node and a fit on the first render. Cards have an avatar or an icon, a title, a subtitle, pills and a chevron for collapsible nodes; a template draws your own cards.

```ts
import { TxOrgChart, orgChartSearch, orgChartToggle } from '@tectra-ng/charts/org-chart';
```

```html
<tx-org-chart [nodes]="nodes" [highlightIds]="matches" (nodeToggle)="toggle($event)" (searchChange)="search($event)" />
```

The chart does not change `nodes` itself: handle `nodeToggle`, `expandAll`, `collapseAll` and `searchChange` and pass new nodes and `highlightIds`. The helpers `orgChartToggle`, `orgChartExpandAll`, `orgChartSearch`, `orgChartReveal` (open the ancestors of the matches) and `orgChartPathTo` do it immutably.

## Inputs
| Name | Description |
|---|---|
| nodes | `{ id, title, kind?, subtitle?, avatar?: { src?, name? }, icon?, pills?: { label, tone?, icon? }[], children?, collapsible?, expanded?, loading?, childrenEmptyText?, minimapTone?, data? }[]` — the roots of the tree |
| highlightIds | Ids of the matching nodes; they get the match outline and their count shows next to the search |
| focusId | Id of a node to centre and zoom to (at least 125%) after it renders |
| labels | Own texts: `title`, `hint`, `search`, `matches` (`{count} found`), `noMatches`, `zoomIn`, `zoomOut`, `resetZoom`, `fit`, `expandAll`, `collapseAll`, `fullscreen`, `exitFullscreen`, `expand`, `collapse`, `more` (the button that holds the actions on a narrow toolbar); default — the tectra locale |
| toolbar | Shows the toolbar; on a narrow chart (under 56rem) expand / collapse all and full screen move into a menu button, under 30rem the zoom buttons too |
| minimap | Shows the minimap in the corner of the canvas (smaller on a canvas under 480px) |
| height | Height of the canvas (`calc(100vh - 15rem)`) |
| busy | Dims the canvas and blocks it while data loads |
| pathKinds | Node `kind`s that draw the path to the root on hover; `null` — every node |
| dt | Design tokens of this chart (`chart`, group `orgChart`) |
| pt | Classes and styles of the parts: `root`, `bar`, `toolbar`, `canvas`, `stage`, `minimap`, `hint` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles and keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| nodeToggle | The chevron of a node was pressed: the node id |
| nodeClick | A card was clicked or pressed with Enter / Space (not after a drag): the node |
| searchChange | The search text, 400ms after typing stops |
| expandAll | "Expand all" was pressed |
| collapseAll | "Collapse all" was pressed |

## Slots
| Name | Description |
|---|---|
| txOrgChartHeader | `<h3 txOrgChartHeader>` — content left of the toolbar |
| txOrgChartNode | `<ng-template txOrgChartNode let-node let-highlighted="highlighted" let-inPath="inPath" let-toggle="toggle">` — own card; `<tx-org-chart-card [node]="node">` is the default card for reuse |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through the toolbar, the canvas, the cards and their chevrons |
| + / − | Zoom in / out |
| 0 | Reset the zoom to 100% |
| F | Fit the tree to the canvas |
| / | Focus the search |
| Arrow keys | Move the canvas (when it has the focus) |
| Enter / Space | Click the focused card |
| Escape | Leave the full screen |
