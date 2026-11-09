# @tectra-ng/qr

```bash
npm install @tectra-ng/qr
```

QR codes in plain TypeScript with no dependencies — for any framework, Node and server rendering. The encoder covers the whole standard: versions 1–40, error-correction levels L, M, Q and H, numeric, alphanumeric and UTF-8 text. On top of it: SVG paths with shaped dots and corner eyes, a finished SVG with colours, gradients and a logo, and a PNG in the browser. `tectra-ng` includes it; in Angular use the `<tx-qr-code>` block from `@tectra-ng/blocks/qr-code`.

```ts
import { qrToPng, qrToSvg } from '@tectra-ng/qr';

const svg = qrToSvg('https://example.com', {
  size: 240,
  dotStyle: 'rounded',
  eyeFrameStyle: 'rounded',
  eyeBallStyle: 'circle',
  gradient: { type: 'linear', colors: ['#111827', '#2563eb'], rotation: 45 },
  logo: '/logo.svg',
});

const png = await qrToPng('https://example.com', { pixelSize: 1024 });
```

## API

| Function | What it does |
|---|---|
| `encodeQr(text, { errorCorrection, minVersion, maxVersion, mask, boostErrorCorrection })` | The matrix: `version`, `size`, `errorCorrection`, `mask`, `modules` (`boolean[][]`, rows of dark modules). Throws `TxQrCapacityError` when the text does not fit |
| `qrPaths(matrix, { dotStyle, eyeFrameStyle, eyeBallStyle, clearSize })` | SVG path data for the dots, the eye rings and the eye centres, in module units |
| `qrLayout(text, style)` | Matrix, paths, the logo box and the view box in one call — for your own SVG |
| `qrGradientLine(gradient, size)` | Coordinates of a linear or radial gradient across the code |
| `qrToSvg(text, options)` | A standalone SVG string |
| `qrToPng(text, options)` | A PNG data URL — browser only |
| `svgToPng(svg, pixelSize)`, `inlineSvgImages(svg)`, `svgDataUrl(svg)` | Helpers for your own SVG: PNG export with the images embedded |

## Options

| Name | Description |
|---|---|
| size | Width and height of the SVG in px (default 200) |
| margin | Quiet zone in modules (default 1) |
| errorCorrection | `L`, `M`, `Q`, `H`; `M` by default, `H` with a logo |
| dotStyle | `square` (default), `dots`, `rounded` (joined neighbours), `soft` |
| eyeFrameStyle, eyeBallStyle | `square` (default), `rounded`, `circle` |
| color, background | Dots and background (`#000000` on `#ffffff` by default) |
| eyeColor, eyeBallColor | Own colours of the eye rings and centres |
| gradient | `{ type: 'linear' \| 'radial', colors: [from, to], rotation }` |
| logo, logoSize, logoMargin | Image in the middle (share of the code, default 0.22, at most 0.4) and the empty modules around it |
| title | `<title>` of the SVG for screen readers |
| pixelSize | PNG side in px (default 1024) |

Keep dark dots on a light background — many scanners cannot read the opposite. The code imports nothing; the published `package.json` lists `tslib` only because the Angular package builder adds it to every package.
