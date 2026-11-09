# Confetti

A one-time burst of confetti from the middle of its box — for a finished onboarding, a confirmed e-mail, a changed password. It covers its positioned parent and takes no clicks.

```html
<div class="done">
  @if (saved()) {
    <tx-confetti [delay]="380" />
  }
</div>
```

```css
.done {
  position: relative;
}
```

The burst plays once when it appears; `play()` plays it again. Ten pieces fly out in the primary, muted and success colours; give your own with `pieces`. It is decorative (`aria-hidden`); with reduced motion the pieces stand still at their places.

## Inputs
| Name | Description |
|---|---|
| pieces | Pieces (`TxConfettiPiece[]`: `x`, `y` — where it lands from the middle in px, `rotate` in degrees, `tone` `accent` / `neutral` / `success`); ten by default |
| delay | Wait before the burst in ms, e.g. until a check mark is drawn (default 0) |
| dt | Design tokens of this instance (`confetti`) |
| pt | Classes and styles of the parts: `root`, `piece` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Methods
| Name | Description |
|---|---|
| play() | Plays the burst again |
