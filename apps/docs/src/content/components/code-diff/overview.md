---
category: Code
tokens: codeDiff, codeSyntax
source: packages/code-editor
readme: packages/code-editor/docs/code-diff.md
package: @tectra-ng/code-editor
import: TxCodeDiff
examples: basic, side-by-side, editable, navigation
---
# Code diff

Shows what changed from `original` to `value`: removed and added lines and the changed characters inside them, inline or side by side. It scrolls to the first change and can let people edit the new side. The diff is computed by the kit, with no library.

Part of `@tectra-ng/code-editor` — install it separately: `npm install @tectra-ng/code-editor`.
