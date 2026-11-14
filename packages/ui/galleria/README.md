# Galleria

A gallery of images: the active one large, with thumbnails, indicators, a caption, previous and next buttons and a slideshow. It also opens full screen over the page.

```html
<tx-galleria [value]="photos" [numVisible]="5" showItemNavigators />
```

Items with `src` (`TxGalleriaImage`: `src`, `thumbnailSrc`, `alt`, `title`, `description`, `width`, `height`) render without templates; `width` and `height` keep the space of an image that is still loading. Any other items need `txGalleriaItem` and `txGalleriaThumbnail`.

## Inputs
| Name | Description |
|---|---|
| value | Items of the gallery |
| activeIndex | Index of the active item; two-way with `[(activeIndex)]` |
| fullScreen | Shows the gallery in a full-screen layer while `visible` is true instead of in the page |
| visible | Whether the full-screen gallery is open; two-way with `[(visible)]` |
| numVisible | Number of thumbnails shown at once |
| responsiveOptions | `numVisible` per `breakpoint` (max width of the window) |
| showItemNavigators | Shows previous and next buttons over the item |
| showItemNavigatorsOnHover | Shows those buttons only while the pointer or focus is on the item |
| showThumbnails | Shows the thumbnails |
| showThumbnailNavigators | Shows previous and next buttons beside the thumbnails |
| thumbnailsPosition | `bottom`, `top`, `left` or `right` |
| verticalThumbnailViewPortHeight | Height of the thumbnails on the left or right |
| showIndicators | Shows a dot per item |
| showIndicatorsOnItem | Puts the dots over the item |
| indicatorsPosition | `bottom`, `top`, `left` or `right` |
| changeItemOnIndicatorHover | Shows the item of a dot when the pointer moves over it |
| circular | The last item goes on to the first and back |
| autoPlay | Starts a slideshow; it pauses on hover and focus |
| transitionInterval | Milliseconds between slideshow steps |
| shouldStopAutoplayByClick | Stops the slideshow when the user moves to another item |
| swipe | Moves between items with a swipe or a mouse drag |
| effect | How one item replaces another: `slide` (default), `fade`, `zoom`, `blur`, `flip` or `none`; the old and the new item move together |
| prevIcon | Icon of the previous buttons |
| nextIcon | Icon of the next buttons |
| closeIcon | Icon of the full-screen close button |
| ariaLabel | Accessible name of the gallery |
| dt | Design tokens of this instance (`galleria`) |
| pt | Classes and styles of the parts: `root`, `mask`, `closeButton`, `header`, `content`, `items`, `item`, `navigator`, `caption`, `indicators`, `indicator`, `thumbnails`, `thumbnailNavigator`, `thumbnail`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| txGalleriaItem | `<ng-template txGalleriaItem let-item let-index="index">` — the active item |
| txGalleriaThumbnail | `<ng-template txGalleriaThumbnail let-item let-index="index" let-active="active">` — one thumbnail; its content names the thumbnail button, so give an image an `alt` |
| txGalleriaCaption | `<ng-template txGalleriaCaption let-item let-index="index">` — caption over the item; `title` and `description` of an image by default |
| txGalleriaIndicator | `<ng-template txGalleriaIndicator let-index let-active="active">` — content of a dot |
| txGalleriaHeader | Content above the gallery |
| txGalleriaFooter | Content below the gallery |

The item templates take the items only for typing — `<ng-template txGalleriaItem [txGalleriaItemOf]="photos" let-photo>` gives `photo` the item type in strict templates; without it the item stays untyped.

## Inputs — item templates
| Name | Description |
|---|---|
| txGalleriaItemOf | `txGalleriaItem`: the items, only for the type of `let-item` |
| txGalleriaThumbnailOf | `txGalleriaThumbnail`: the items, only for the type of `let-item` |
| txGalleriaCaptionOf | `txGalleriaCaption`: the items, only for the type of `let-item` |

## Keyboard
| Key | Action |
|---|---|
| Tab / Shift + Tab | Moves between the item, its buttons, the current dot and the current thumbnail |
| Arrow left / Arrow right | On the item: shows the previous or next item |
| Arrow keys | On the thumbnails or dots: selects the previous or next item |
| Home / End | On the thumbnails or dots: selects the first or the last item |
| Escape | Closes the full-screen gallery |
