# Code highlight

Part of `@tectra-ng/code-editor`, without the editor engine: the tokenizers of HTML (with `<script>` and `<style>` inside), CSS, JavaScript, TypeScript, JSON, Markdown (with fenced code) and plain text, and `tx-code-highlight` — highlighted code rendered on the server, with the colours of the code editor.

```html
<tx-code-highlight language="json" [code]="response" />
```

```ts
import { highlightCode } from '@tectra-ng/code-editor/highlight';

const lines = highlightCode('const a = 1;', 'javascript');
// [[{ from: 0, to: 5, type: 'keyword' }, …]]
```

## Inputs
| Name | Description |
|---|---|
| code | The code to show |
| language | `html`, `css`, `javascript`, `typescript`, `json`, `markdown` or `plain` |
| lineNumbers | Shows the line numbers |
| wordWrap | Wraps long lines instead of scrolling sideways |
| firstLine | Number of the first line |
| indentGuides | Thin vertical lines at every indent level |
| tabSize | Columns per indent level for the guides and tabs |
| height | Fixed height; it scrolls inside. By default it follows the code |
| ariaLabel | Accessible name of the code region |
| dt | Design tokens of this view (`codeHighlight`); `syntax` changes the colours of the code |
| pt | Classes and styles of the parts: `root`, `content`, `line`, `gutter` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Drops the tectra styles |

## Functions
| Name | Description |
|---|---|
| highlightCode(code, language) | Tokens of every line: `{ from, to, type }[][]` |
| tokenizeLine(mode, text, state) | Tokens of one line with a state carried between lines |
| getCodeMode(language) | The tokenizer of a language |
| resolveCodeLanguage(name) | `'js'` → `'javascript'`, `null` for an unknown name |
