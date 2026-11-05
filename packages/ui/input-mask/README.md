# Input mask

Formats a text field as you type: phones, dates, cards, codes. Put `txInputMask` on a native input (with `txInput` for the tectra look). Fixed characters are typed for you, Backspace and Delete skip them, a pasted value is cleaned and fitted.

```html
<input txInput txInputMask="(999) 999-9999" formControlName="phone" [unmask]="true" />
```

Mask characters: `9` — a digit, `a` — a letter (`characterPattern`), `*` — a letter or a digit, `?` — everything after it is optional. Any other character is fixed.

## Inputs
| Name | Description |
|---|---|
| txInputMask | The mask, e.g. `99/99/9999` |
| slotChar | Placeholder shown in empty positions while the field has focus |
| autoClear | Clears an incomplete value when the field loses focus |
| unmask | The model gets only the typed characters, without the fixed ones |
| characterPattern | What `a` accepts, as a RegExp class, e.g. `[A-Za-zА-Яа-яІіЇїЄєҐґ]` |

## Outputs
| Name | Description |
|---|---|
| completed | Every required position is filled — the value |

## Keyboard
| Key | Action |
|---|---|
| Character | Fills the next free position, skipping fixed characters; ignored when it does not fit |
| Backspace / Delete | Removes the character before / after the caret and shifts the rest |
| Paste | Keeps the characters that fit and fills the mask with them |
