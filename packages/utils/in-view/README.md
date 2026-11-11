# In View

Knows when an element scrolls into view — to animate it in, count an impression, load a picture or a chart late. `txInView` adds the `tx-in-view` class and your enter / leave classes, and reports `entered` and `left`; `txVisibleOnScroll` watches a scrolling list and reports each fully visible item once (mark notifications read, track seen rows). Both use one `IntersectionObserver`, start in the browser only, and treat a browser without it as "in view". To render a heavy block only when it comes near, use Angular's `@defer (on viewport)`.

```html
<section txInView enterClass="fade-up" (entered)="track('pricing')">…</section>

<div class="list" [txVisibleOnScroll]="notifications()" (itemVisible)="markRead($event)">
  @for (item of notifications(); track item.id) { <tx-message … /> }
</div>
```

## Inputs
| Name | Description |
|---|---|
| threshold | `txInView`: share of the element that must be visible, 0–1 |
| rootMargin | `txInView`: grows or shrinks the viewport, e.g. `0px 0px -20% 0px` |
| once | `txInView`: stop watching after the first entry |
| enterClass | `txInView`: classes added when the element is in view |
| leaveClass | `txInView`: classes added when it leaves (with `once` off) |
| txVisibleOnScroll | Items of the list in the order of the children: `{ id, ignore? }`; ids that leave the list are forgotten |
| visibleRatio | `txVisibleOnScroll`: share of an item that counts as fully visible; items taller than the box never count |

## Outputs
| Name | Description |
|---|---|
| entered | `txInView`: the element came into view |
| left | `txInView`: the element left the view |
| itemVisible | `txVisibleOnScroll`: id of an item seen for the first time |

## Methods
| Name | Description |
|---|---|
| isInView | `txInView` (`exportAs: 'txInView'`): signal, `true` while in view (stays `true` with `once`) |
