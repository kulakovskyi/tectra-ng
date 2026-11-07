# Image

An image with an optional full-screen preview: a dark layer over the page with rotate and zoom controls, zoom by the wheel or a double click, and dragging a zoomed image around.

```html
<tx-image src="/photos/lake-small.jpg" previewSrc="/photos/lake.jpg" alt="Alpine lake" width="320" preview />
```

## Inputs
| Name | Description |
|---|---|
| src | Source of the image |
| srcSet | `srcset` of the image |
| sizes | `sizes` of the image |
| previewSrc | Source shown in the preview, for example a larger file; `src` when empty |
| previewSrcSet | `srcset` of the preview image |
| previewSizes | `sizes` of the preview image |
| alt | Alternative text; also names the preview dialog |
| width | `width` attribute of the image |
| height | `height` attribute of the image |
| loading | `lazy` or `eager` loading of the image |
| preview | Shows a zoom button over the image that opens the preview |
| previewIcon | Icon of the zoom button |
| zoomStep | How much one zoom step changes the scale |
| minZoom | Smallest scale in the preview |
| maxZoom | Largest scale in the preview |
| ariaLabel | Accessible name of the preview dialog when `alt` does not describe it |
| dt | Design tokens of this instance (`image`) |
| pt | Classes and styles of the parts: `root`, `image`, `previewButton`, `previewIcon`, `mask`, `toolbar`, `action`, `original` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| opened | The preview opened |
| closed | The preview closed and its animation ended |
| imageError | The image failed to load |

## Slots
| Name | Description |
|---|---|
| txImageIndicator | `<ng-template txImageIndicator let-src>` — content of the zoom button over the image |
| txImagePreview | `<ng-template txImagePreview let-src let-style="style" let-close="close">` — own preview content; `style` carries the rotate and zoom transform |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the image: opens the preview |
| Tab / Shift + Tab | Moves through the preview controls; focus stays in the preview |
| + / = | Zooms in |
| - | Zooms out |
| 0 | Resets the zoom |
| Escape | Closes the preview and returns focus to the image |
