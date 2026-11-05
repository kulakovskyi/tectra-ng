# Mention textarea

A text area where typing `@` suggests people (or anything else) next to the caret; the chosen one is inserted as `@Name`. `mentionsChange` reports who is mentioned in the text right now. The value is the text; works with `[formControl]`, `ngModel` and signal forms. Built on `txTextarea` and the select option list.

## Inputs
| Name | Description |
|---|---|
| suggestions | Items to suggest: `{ label, value, image?, description? }` |
| trigger | Character that starts a mention (`@` by default) |
| localSearch | Filters `suggestions` by the typed text (on by default); turn off to search on a server through `filtered` |
| filterMatchMode | `contains`, `startsWith`, `endsWith` or `equals` with `localSearch` |
| filterBy | Fields to search in, comma separated (`label` by default) |
| filterDelay | Milliseconds to wait before `filtered` is emitted |
| loading | Shows "Loading" in the suggestions |
| emptyMessage | Text when there is nothing to suggest |
| lines | Visible rows of the text area |
| autoResize | Grows with the text |
| placeholder | Text shown in an empty field |
| inputId | Id of the text area for a `<label for>` |
| ariaLabel | Accessible name of the text area |
| ariaLabelledBy | Id of the element that labels the text area |
| invalid | Red border and `aria-invalid`; follows the form control by default |
| readonly | Text cannot be changed |
| dt | Design tokens of this instance (`mention`) |
| pt | Classes and styles of the parts: `root`, `textarea`, `panel`, `list`, `option`, `empty` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| mentionsChange | Values of the items mentioned in the text, when the list changes |
| mentioned | An item was inserted |
| filtered | The text after the trigger changed: `{ query }` |

## Slots
| Name | Description |
|---|---|
| txSelectOption | `<ng-template txSelectOption let-item>` — own markup of a suggestion |

## Keyboard
| Key | Action |
|---|---|
| @ | Starts a mention and shows the suggestions at the caret |
| ArrowDown / ArrowUp | Moves the active suggestion |
| Enter / Tab | Inserts the active suggestion |
| Escape | Closes the suggestions, the text stays |
