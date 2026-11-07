# Editor

A rich text editor for descriptions, comments and reports. It writes clean HTML (or Quill 2 markup with `format="quill"`) and reads both, so text saved by Quill opens as it was. Toolbar presets or your own tool list, a menu over selected text, links, colours, lists and checklists, images and video, `@` mentions, Markdown shortcuts, a character limit, a full view and an AI button. Show saved text with `tx-editor-content` from `@tectra-ng/editor/content`.

```html
<tx-editor [formControl]="description" placeholder="Describe the task" height="220px" />

<tx-editor toolbar="compact" [mentions]="findPeople" (mentionSelected)="notify($event)" [(html)]="comment" />

<tx-editor [toolbar]="[['bold', 'italic'], ['bulletList', 'link']]" format="quill" [maxLength]="2000" />
```

The engine is the ProseMirror core (model, state, view, transform); everything above it — the schema, commands, keyboard, undo history, lists, Markdown shortcuts, autolinks and mentions — is part of the package. `@tectra-ng/ui` does not depend on it.

Tools: `undo`, `redo`, `blockStyle`, `fontSize`, `bold`, `italic`, `underline`, `strike`, `code`, `subscript`, `superscript`, `textColor`, `highlight`, `bulletList`, `orderedList`, `taskList`, `outdent`, `indent`, `align`, `link`, `image`, `video`, `blockquote`, `codeBlock`, `horizontalRule`, `clearFormatting`.

## Inputs
| Name | Description |
|---|---|
| html | Two-way: the HTML of the text; a form control works too |
| format | `html` (clean HTML) or `quill` (Quill 2 markup) for the value it writes; both are read |
| toolbar | `full`, `compact`, `minimal`, `none` or own groups of tools: `[['bold', 'italic'], ['link']]` |
| headingLevels | Heading levels in the text style menu; `full` offers 1–6, the others 1–2 |
| placeholder | Text shown while the editor is empty |
| readonly | Shows the text without editing; the toolbar is turned off |
| disabled | Turns the editor off |
| invalid | Red frame; follows the form control by default |
| height | Height of the text area, e.g. `220px`; it scrolls inside |
| minHeight | Minimum height of the text area |
| maxHeight | Maximum height; the area grows with the text until then |
| maxLength | Most characters; typing and pasting stop at the limit and the counter shows it |
| showCount | Shows the character counter without a limit |
| linkTarget | `_blank` (new tab, the default) or `_self` for new links |
| textColors | Text colour palette, `{ label, value }`; `label` may be a translation key |
| highlightColors | Highlight palette |
| imageUpload | `(file) => Promise<url>`; without it images are embedded as data URLs |
| maxImageSize | Largest image in bytes; a bigger one emits `imageRejected` |
| mentions | `(query) => items` or a Promise of them: turns on `@` mentions with a suggestion list |
| mentionTrigger | Character that starts a mention |
| selectionMenu | Shows the menu over selected text and over links |
| ai | Shows the AI button; it emits `aiRequested` |
| aiLabel | Label of the AI button |
| fullView | Two-way: the editor fills the window over a backdrop |
| fullViewButton | Shows the full view button (on with the `full` toolbar) |
| ariaLabel | Accessible name of the text area |
| ariaLabelledBy | Id of the element that names the text area |
| dt | Design tokens of this instance (`editor`); the text uses `editorContent` |
| pt | Classes and styles of the parts: `root`, `toolbar`, `tool`, `content`, `footer`, `bubble`, `suggestions` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`focus()`, `clear()`, `getHtml()`, `getText()` and `insertHtml(html)`; `editorView` is the ProseMirror view for own plugins and commands.

## Outputs
| Name | Description |
|---|---|
| htmlChange | The HTML changed |
| fullViewChange | The full view was opened or closed |
| textChange | `{ html, text }` after every change |
| selectionChange | `{ from, to, empty, text }` |
| focused | The text area got focus |
| blurred | The text area lost focus |
| ready | The editor view was created |
| aiRequested | The AI button was pressed; emits the HTML |
| imageRejected | An image was not added: `{ file, reason: 'type' \| 'size', message }` |
| mentionSelected | A mention was picked from the list |

## Slots
| Name | Description |
|---|---|
| txEditorToolbarEnd | Content at the end of the toolbar, before the AI and full view buttons |

## Keyboard
| Key | Action |
|---|---|
| Ctrl / ⌘ + B, I, U | Bold, italic, underline |
| Ctrl / ⌘ + Shift + S | Strikethrough |
| Ctrl / ⌘ + E | Inline code |
| Ctrl / ⌘ + , / . | Subscript / superscript |
| Ctrl / ⌘ + K | Add or edit a link |
| Ctrl / ⌘ + Alt + 0 … 6 | Normal text, heading 1 … 6 |
| Ctrl / ⌘ + Shift + 7 / 8 / 9 | Numbered, bulleted, checklist |
| Ctrl / ⌘ + Shift + B | Quote |
| Ctrl / ⌘ + Alt + C | Code block |
| Ctrl / ⌘ + ] / [ | Indent / outdent |
| Tab / Shift + Tab | In a list: nest / lift the item; elsewhere moves focus |
| Ctrl / ⌘ + Z, Ctrl / ⌘ + Shift + Z | Undo, redo |
| Shift + Enter | Line break |
| Ctrl / ⌘ + Enter | Leave a code block |
| `#`–`######`, `-`, `1.`, `[ ]`, `>`, ```` ``` ````, `---` + space | Heading, list, checklist, quote, code block, divider |
| `**bold**`, `*italic*`, `~~strike~~`, `` `code` `` | Inline formats while typing |
| Up / Down, Enter, Escape | In the mention list: move, pick, close |
| Left / Right, Home / End | In the toolbar: move between the tools |
| Escape | Leaves the full view |
