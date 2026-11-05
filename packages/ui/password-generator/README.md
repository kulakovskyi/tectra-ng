# Password generator

Strong random passwords from `crypto.getRandomValues` (no bias, at least one character of every set, shuffled). Use the `TxPasswordGenerator` service, or put `txPasswordGenerate` on a button to fill a `tx-password` (and show it) or any form control.

```html
<tx-password #password formControlName="password" [toggleMask]="true" autocomplete="new-password" />
<button txButton icon="refresh" [txPasswordGenerate]="password" [length]="20">Generate</button>
```

```ts
const password = inject(TxPasswordGenerator).generate({ length: 24, symbols: false });
```

## Inputs
| Name | Description |
|---|---|
| txPasswordGenerate | What to fill: a `tx-password` (shown after filling) or a form control |
| length | Number of characters (16 by default) |
| lowercase | Use a – z |
| uppercase | Use A – Z |
| digits | Use 0 – 9 |
| symbols | Use symbols like `!@#$%` |
| excludeSimilar | Leave out characters that look alike: `0 O 1 l I \|` |
| reveal | Shows the generated password in a `tx-password` |

## Outputs
| Name | Description |
|---|---|
| generated | The new password |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Generates a password from the focused button |
