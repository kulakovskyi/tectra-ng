# Code diff

Shows the changes from `original` to `value`: removed and added lines and the changed characters inside them, inline (removed lines above the added ones) or side by side with aligned rows and shared scrolling. It scrolls to the first change. Without `readOnly` the new side is an editor with the same keys as `tx-code-editor`. The diff is computed by the package (Myers on lines, then on characters), with no library.

```html
<tx-code-diff language="html" [original]="published" [(value)]="draft" />

<tx-code-diff view="split" language="json" [original]="before" [value]="after" readOnly />
```

## Inputs
| Name | Description |
|---|---|
| original | The original text |
| value | Two-way: the new text |
| language | Language of both texts, as in `tx-code-editor` |
| view | `inline` (one column) or `split` (side by side) |
| readOnly | Blocks edits of the new side |
| lineNumbers | Shows the line numbers |
| wordWrap | Wraps long lines in the inline view |
| indentGuides | Thin vertical lines at every indent level |
| ignoreTrimWhitespace | Spaces at the start and end of a line do not count as a change |
| scrollToFirstChange | Scrolls to the first change when the texts load |
| height | Height of the diff, e.g. `400px`; `100%` fills the parent |
| ariaLabel | Accessible name of the diff |
| dt | Design tokens of this diff (`codeDiff`); `syntax` changes the colours of the code |
| pt | Classes and styles of the parts: `root`, `original`, `modified` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Drops the tectra styles, keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| valueChange | The new text after every edit |
| changed | `{ added, removed, changes }` — counts of added and removed lines and of changed blocks |

## Methods
| Name | Description |
|---|---|
| nextChange() / previousChange() | Moves to the next or previous change |

## Keyboard
| Key | Action |
|---|---|
| F7 / Shift+F7 | Next or previous change |
| Other keys | As in the code editor |
