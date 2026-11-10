# Mascot

A pixel-art mascot drawn as SVG in the accent colour, with animated states: idle, thinking, happy, sleeping, walking and short tricks (waving, looking, hopping, dancing, stretching). For assistants, empty states and onboarding. While idle it plays a random trick from time to time.

```html
<tx-mascot [state]="thinking() ? 'thinking' : 'idle'" label="Assistant" />
```

## Inputs
| Name | Description |
|---|---|
| state | `idle`, `thinking`, `happy`, `sleeping`, `walking`, or a trick: `waving`, `looking`, `hopping`, `dancing`, `stretching` |
| label | Accessible name; empty makes the mascot decorative (`aria-hidden`) |
| playful | While `state` is `idle`, plays a random trick every 9 seconds; `false` keeps it plain idle |
| size | Width as a number of px or any CSS length; the height follows (15 : 12). 48px by default |
| dt | Design tokens of this instance (`mascot`): size and the body, shade, glow and eye colours |
| pt | Classes and styles of the parts: `root`, `svg` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles (colours and motion) |

## Sprite
The figure is `TX_MASCOT_SPRITE`, rows of characters on a 15 × 12 grid; `txMascotLayers(parts, sprite)` turns it into pixels per part.

## Notes
- The animations step pixel by pixel and stop under `prefers-reduced-motion`.
- The first paint is always the given `state`, also on the server; tricks start in the browser.
