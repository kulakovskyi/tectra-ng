# QR code

A string drawn as a QR code — a link, a sign-in secret, Wi-Fi details. The encoder is tectra's own: every version (1–40), the four error-correction levels, numeric, alphanumeric and UTF-8 text, no dependency. The code is an SVG, so it renders on the server the same way, stays sharp at any size and downloads as SVG or PNG.

```html
<tx-qr-code data="https://example.com/r/7Q2M" [size]="200" />

<tx-qr-code
  data="https://example.com"
  dotStyle="rounded"
  eyeFrameStyle="rounded"
  eyeBallStyle="circle"
  [gradient]="{ type: 'linear', colors: ['#111827', '#2563eb'], rotation: 45 }"
  logo="/logo.svg"
/>
```

With a `logo` the dots under it are left out and the error correction goes up to `H`, so phones still read the code. Keep dark dots on a light background — many scanners cannot read the opposite. Data that does not fit shows a translated "Unable to render QR code".

`encodeQr(text, options)` returns the matrix (`version`, `size`, `errorCorrection`, `mask`, `modules`) for your own drawing; `qrPaths(matrix, shapes)` gives the SVG paths.

## Inputs
| Name | Description |
|---|---|
| data | Required. Text to encode; empty — nothing is drawn |
| size | Width and height in px (default 200) |
| margin | Quiet zone around the code, in modules (default 1) |
| errorCorrection | `L`, `M`, `Q` or `H`; `M` by default, `H` with a logo |
| dotStyle | `square` (default), `dots`, `rounded` — joined neighbours, `soft` — separate rounded squares |
| eyeFrameStyle | Outer ring of the three corner eyes: `square` (default), `rounded`, `circle` |
| eyeBallStyle | Centre of the eyes: `square` (default), `rounded`, `circle` |
| color | Colour of the dots (the `color` token by default) |
| background | Background colour (the `background` token by default) |
| eyeColor | Colour of the eye rings, and of their centres unless `eyeBallColor` is set |
| eyeBallColor | Colour of the eye centres |
| gradient | `{ type: 'linear' \| 'radial', colors: [from, to], rotation }` for the dots and the eyes without their own colour |
| logo | Image URL in the middle |
| logoSize | Logo side as a share of the code (default 0.22, at most 0.4) |
| logoMargin | Empty modules around the logo (default 1) |
| ariaLabel | Accessible name (translated "QR code" by default) |
| dt | Design tokens of this instance (`qrCode`) |
| pt | Classes and styles of the parts: `root`, `svg`, `error` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Methods
| Name | Description |
|---|---|
| download(format, fileName, pixelSize) | Saves the code as `png` (default, 1024 px) or `svg`; the logo is embedded |
| toDataUrl(format, pixelSize) | The image as a data URL |
| toSvgString() | A standalone SVG with the colours resolved |
| matrix | Signal: the encoded matrix, or `null` |
