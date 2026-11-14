# Carousel

Shows a list of items a few at a time and pages through them with buttons, indicators, swipes or on its own. Horizontal or vertical, with a different number of visible items per screen width.

```html
<tx-carousel [value]="products" [numVisible]="3" [numScroll]="1" ariaLabel="New arrivals">
  <ng-template txCarouselItem let-product>
    <article class="card">{{ product.name }}</article>
  </ng-template>
</tx-carousel>
```

## Inputs
| Name | Description |
|---|---|
| value | Items to show |
| page | Index of the current page; two-way with `[(page)]` |
| numVisible | Number of items shown at once |
| numScroll | Number of items one step moves |
| responsiveOptions | `numVisible` and `numScroll` per `breakpoint` (max width of the window), for example `[{ breakpoint: '768px', numVisible: 1 }]` |
| orientation | `horizontal` or `vertical` |
| verticalViewPortHeight | Height of the visible area in vertical orientation |
| circular | The last page goes on to the first and back |
| autoplayInterval | Milliseconds between automatic steps; `0` turns autoplay off. Autoplay pauses on hover and focus and stops after a manual step |
| showIndicators | Shows the page indicators |
| showNavigators | Shows the previous and next buttons |
| swipe | Pages with a swipe or a mouse drag |
| effect | How a page replaces the previous one: `slide` (default) moves the strip; `fade`, `zoom`, `blur` and `flip` let the visible items leave and the next ones arrive; `none` jumps |
| prevIcon | Icon of the previous button; a chevron that follows the orientation by default |
| nextIcon | Icon of the next button |
| ariaLabel | Accessible name of the carousel |
| ariaLabelledBy | Id of the element that names the carousel |
| dt | Design tokens of this instance (`carousel`) |
| pt | Classes and styles of the parts: `root`, `header`, `content`, `viewport`, `track`, `item`, `navigator`, `indicators`, `indicator`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txCarouselItem | `<ng-template txCarouselItem let-item let-index="index" let-active="active">` — one item; `active` is true while it is visible |
| txCarouselIndicator | `<ng-template txCarouselIndicator let-page let-active="active">` — content of a page indicator |
| txCarouselHeader | Content above the carousel |
| txCarouselFooter | Content below the carousel |

The item template takes the items only for typing — `<ng-template txCarouselItem [txCarouselItemOf]="products" let-product>` gives `product` the item type in strict templates; without it the item stays untyped.

## Inputs — item template
| Name | Description |
|---|---|
| txCarouselItemOf | `txCarouselItem`: the items, only for the type of `let-item` |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves between the previous button, the visible items, the next button and the current indicator |
| Enter / Space | On a button: moves to the previous or next page, or to the page of the indicator |
| Arrow right / Arrow down | On an indicator: shows the next page |
| Arrow left / Arrow up | On an indicator: shows the previous page |
| Home / End | On an indicator: shows the first or the last page |
