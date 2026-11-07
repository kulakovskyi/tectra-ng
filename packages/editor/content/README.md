# Editor content

Shows saved rich text — clean HTML from `tx-editor` or Quill 2 markup — with the same typography as the editor. An own allowlist sanitizer keeps colours, alignment and indents and drops scripts, handlers and unsafe links; images open in a preview. The entry point does not load the editor engine.

```html
<tx-editor-content [html]="comment.html" />
```

`fromQuillHtml(html)` / `toEditorHtml(html)` turn Quill markup into clean HTML, `toQuillHtml(html)` does the opposite, `sanitizeEditorHtml(html)` cleans any HTML for display.

## Inputs
| Name | Description |
|---|---|
| html | The saved HTML, clean or Quill |
| previewImages | Images open in a preview dialog on click |
| dt | Design tokens of this instance (`editorContent`) |
| pt | Classes and styles of the parts: `root`, `body` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| imageClick | An image was clicked: `{ originalEvent, src, alt }` |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through the links in the text |
| Escape | Closes the image preview |
