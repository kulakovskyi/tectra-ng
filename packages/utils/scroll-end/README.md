# Scroll End

Infinite scrolling for a box: asks for the next page when the user scrolls near the end, once per page — it waits until new content makes the box taller — and stops when everything is loaded.

```html
<div class="list" txScrollEnd [currentCount]="items().length" [maxLimit]="total()" (scrolledToBottom)="loadMore()">…</div>
```

## Inputs
| Name | Description |
|---|---|
| offset | Distance from the end in px that counts as the end |
| currentCount | How many items are loaded |
| maxLimit | How many there are; no more requests once `currentCount` reaches it |
| disabled | Stops asking, e.g. while a page loads |

## Outputs
| Name | Description |
|---|---|
| scrolledToBottom | Time to load the next page |

## Methods
| Name | Description |
|---|---|
| reset() | Forget the last height — after replacing the list with a shorter one (`exportAs: 'txScrollEnd'`) |
