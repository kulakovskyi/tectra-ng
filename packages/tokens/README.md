# @tectra-ng/tokens

Primitive design tokens — plain data, no Angular, no meaning yet. `@tectra-ng/themes` gives them meaning (what is "primary", "surface", "danger" in light and dark).

| File | What it holds |
|---|---|
| `palettes/surface.palette.ts` | `SURFACE_PALETTES` — neutral scales 0…950 for backgrounds, borders and text: `ink` (default, also `INK_SURFACE`), `slate`, `gray`, `zinc`, `neutral`, `stone`, `soho`, `viva`, `ocean`, `mauve`, `olive`, `mist`, `taupe` |
| `palettes/accent.palette.ts` | `ACCENT_PALETTES` — `blue`, `green`, `purple`, `cyan`, `teal`: one per product accent |
| `palettes/severity.palette.ts` | `SEVERITY_PALETTES` — `red`, `green`, `orange`, `sky`, `purple` for danger / success / warn / info / help |
| `primitives/radius.ts` | `none`, `xs` 3px, `sm` 5px, `md` 7px, `lg` 10px, `xl` 14px, `full` |
| `primitives/typography.ts` | Onest + JetBrains Mono, sizes, weights |
| `primitives/shadows.ts` | `field`, `overlay`, `modal` |
| `primitives/spacing.ts`, `primitives/motion.ts` | spacing scale, transition duration |

Depends on: nothing.
