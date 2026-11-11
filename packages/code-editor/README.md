# Code editor

```bash
npm install @tectra-ng/code-editor
```

Its own package: `tectra-ng` and `@tectra-ng/ui` do not include it, so apps without a code editor do not carry the engine. It needs `@tectra-ng/ui` (and with it `core`, `themes`, `icons`) of the same version.

An editor for HTML, CSS, JavaScript, TypeScript, JSON and Markdown. Syntax colours come from the design tokens (light, dark and every theme), line numbers, undo and redo, smart indents, auto-closed brackets, quotes and HTML tags, comments with Ctrl/⌘+/, line moves, bracket matching, search and replace, and form support. On the server it renders the highlighted code with the same size, so the page does not jump when the editor starts after hydration. `tx-code-diff` shows the changes between two texts; `@tectra-ng/code-editor/highlight` has the tokenizers and a static `tx-code-highlight` view without the engine.

```html
<tx-code-editor [(value)]="html" height="400px" />

<tx-code-editor language="json" [formControl]="settings" height="240px" />

<tx-code-editor diffMode [originalValue]="saved" [(value)]="draft" />
```

The engine is the CodeMirror core (state and view): input, selection and the visible part of long files. Everything above it — the tokenizers, colours, undo history, commands, search and the diff — is part of the package. `@tectra-ng/ui` does not depend on it.

## Inputs
| Name | Description |
|---|---|
| value | Two-way: the text; a form control works too |
| language | `html`, `css`, `javascript`, `typescript`, `json`, `markdown` or `plain`; short names (`js`, `ts`, `md`, `plaintext`) work too |
| height | Height of the editor, e.g. `400px`; `100%` fills the parent |
| readOnly | Keeps the cursor, selection, copy and search, blocks edits |
| lineNumbers | Shows the line numbers |
| wordWrap | Wraps long lines instead of scrolling sideways; the rest of a line keeps its indent |
| indentGuides | Thin vertical lines at every indent level; they go on over blank lines |
| tabSize | Spaces per indent; taken from the text when not set |
| placeholder | Text shown while the editor is empty |
| search | Turns on search and replace (Ctrl/⌘+F) |
| disabled | Turns the editor off; follows the form control by default |
| invalid | Red frame; follows the form control by default |
| ariaLabel | Accessible name of the text area |
| ariaLabelledBy | Id of the element that names the text area |
| diffMode | Shows the changes from `originalValue` to `value` inline instead of the editor |
| originalValue | The original text for `diffMode` |
| diffView | `inline` or `split` for `diffMode` |
| dt | Design tokens of this editor (`codeEditor`); `syntax` changes the colours of the code (`codeSyntax`) |
| pt | Classes and styles of the parts: `root`, `editor`, `search`, `searchInput` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Drops the tectra styles, keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| valueChange | The text after every edit |
| codeChanged | The text after every edit (same as `valueChange`) |
| focused | The text area got focus |
| blurred | The text area lost focus; touches the form control |
| diffChanged | Counts of added and removed lines in `diffMode` |

## Methods
| Name | Description |
|---|---|
| focus() | Moves focus into the editor |
| undo() / redo() | Undoes or redoes the last change |
| openSearch(replace?) | Opens search, or search and replace |
| closeSearch() | Closes search and returns focus to the text |
| findNext() / findPrevious() | Selects the next or previous match |
| replaceCurrent() / replaceAll() | Replaces the selected match or every match |

## Keyboard
| Key | Action |
|---|---|
| Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl+Y | Undo, redo |
| Tab / Shift+Tab | Indents or outdents; Escape and then Tab moves focus out of the editor |
| Enter | New line with the same indent, one level more after an opening bracket or tag |
| Ctrl/⌘+/ | Comments or uncomments the lines |
| Ctrl/⌘+] / Ctrl/⌘+[ | Indents or outdents the lines |
| Alt+↑ / Alt+↓ | Moves the lines up or down |
| Shift+Alt+↑ / Shift+Alt+↓ | Copies the lines up or down |
| Ctrl/⌘+Shift+K | Deletes the lines |
| Ctrl/⌘+A | Selects all |
| Ctrl/⌘+F | Opens search |
| Ctrl+H, ⌥⌘F on macOS | Opens search and replace |
| Enter / Shift+Enter, F3 / Shift+F3 | Next or previous match |
| Ctrl/⌘+Enter in the replace field | Replaces every match |
| Escape | Closes search |
