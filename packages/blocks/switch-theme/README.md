# Switch theme

A round button that switches between the light and the dark theme. The sun and the moon swap with a turn, and the new theme grows as a circle from the click. The circle comes from the `txThemeReveal` directive — put it on any element that changes the theme.

```html
<tx-switch-theme (modeChange)="save($event)" />

<button txButton text icon="moon" txThemeReveal (themeChange)="theme.toggleMode()">Theme</button>
```

It reads and sets the mode of `TxThemeService` (`data-tx-theme` on `<html>`); keep the choice with `modeChange`. The circle needs the View Transitions API; without it, or with reduced motion, the theme changes at once.

## Inputs
| Name | Description |
|---|---|
| revealDuration | Length of the circle in ms (default 550); also on `txThemeReveal` |
| revealEasing | Easing of the circle; also on `txThemeReveal` |
| dt | Design tokens of this instance (`switchTheme`) |
| pt | Classes and styles of the parts: `root`, `button`, `icon` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| modeChange | The new mode, `light` or `dark` |
| themeChange | `txThemeReveal`: change the theme now — it runs inside the view transition |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Switches the theme; the circle starts from the middle of the button |
