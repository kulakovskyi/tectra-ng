# Accordion

A list of collapsible sections in a bordered box — FAQ blocks, grouped details, long settings. Build it from panels, or pass an array of items with header and content templates.

```html
<tx-accordion [(value)]="open">
  <tx-accordion-panel value="dns">
    <tx-accordion-header>DNS</tx-accordion-header>
    <tx-accordion-content>Records of the zone</tx-accordion-content>
  </tx-accordion-panel>
</tx-accordion>

<tx-accordion [items]="sections" [(value)]="open" (opened)="load($event.index)">
  <ng-template txAccordionHeader let-item>{{ item.header }}</ng-template>
  <ng-template txAccordionContent let-item>{{ item.content }}</ng-template>
</tx-accordion>
```

`TxAccordionItem`: `header`, `content`, `value` (the index when empty), `tone` (`info`, `success`, `warn`, `danger` — a coloured bar on the left of the header), `disabled`, plus any fields you need in the templates.

## Inputs
| Name | Description |
|---|---|
| value | Two-way: the open panels — an array of values, or one value / `null` when `multiple` is off |
| multiple | Several panels can be open at once (on by default) |
| items | Panels as an array of `TxAccordionItem` |
| expandIcon | Icon of a closed panel instead of the chevron |
| collapseIcon | Icon of an open panel instead of the chevron |
| selectOnFocus | The arrow keys open the header they land on |
| headingLevel | `tx-accordion-header`: wraps the header in a heading of this level |
| tone | `tx-accordion-panel`: `info`, `success`, `warn` or `danger` |
| disabled | `tx-accordion-panel`: the panel cannot be opened |
| dt | Design tokens of this instance (`accordion`) |
| pt | Classes and styles of the parts: `root`, `panel`, `header`, `headerContent`, `toggleIcon`, `content`, `contentInner` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`tx-accordion-panel` takes a required `value`.

## Outputs
| Name | Description |
|---|---|
| valueChange | The open panels changed |
| opened | A panel was opened: `{ value, index, item }` |
| closed | A panel was closed: `{ value, index, item }` |

## Slots
| Name | Description |
|---|---|
| tx-accordion-panel | A panel with a `tx-accordion-header` and a `tx-accordion-content` |
| txAccordionHeader | `<ng-template txAccordionHeader let-item let-index="index" let-active="active">` — header of each item |
| txAccordionContent | `<ng-template txAccordionContent let-item>` — content of each item, or lazy content inside `tx-accordion-content`; created on the first open |
| txAccordionToggleIcon | `<ng-template txAccordionToggleIcon let-active>` — own toggle icon |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves between the headers and the content of open panels |
| Down / Up arrow | Next / previous header; disabled panels are skipped |
| Home / End | First / last header |
| Enter / Space | Opens or closes the panel |
