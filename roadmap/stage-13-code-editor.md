# Stage 13 — code editor, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Reference: the first consumer app's code editor wrapper (a Monaco editor: `value`, `language` = `'html'` by default, `height` = `'600px'` by default, `readOnly`, `codeChanged`, `diffMode` + `originalValue` for an inline diff that scrolls to the first change; font size 14, word wrap on, no minimap, the light / dark Monaco themes, a 1px `surface-border` border with the control radius) and the PrimeNG Editor / Textarea look for the frame. Usage = 16 files of the first app (2026-11-11): HTML (pages, templates, posts, redirects), JavaScript (workers), JSON (bindings, logs, AI blocks) and a prompt text; one inline diff.

**Engine decision (2026-11-11):** the CodeMirror 6 core only — `@codemirror/state` and `@codemirror/view` (MIT; with their small helpers `style-mod`, `w3c-keyname`, `crelt`, `@marijn/find-cluster-break`). They hold the hard engine part: `contenteditable` input, IME, selection, a virtual viewport for long files. Everything above is our code, the same split as the rich text editor: the tokenizers of every language, highlighting from tokens, undo history, editing commands and keymap, search and replace in the kit look, bracket matching, the diff algorithm and views. Monaco was the other option: heavy (several MB, workers), its own look and no server rendering. The language packs of CodeMirror (`@codemirror/language`, `@lezer/*`) are not taken: one own tokenizer runs on the server too, so the server HTML and the editor after hydration show the same colours.

**Package:** `@tectra-ng/code-editor`, own package like `@tectra-ng/editor`, so the engine dependencies stay out of `ui`. Entry points: `@tectra-ng/code-editor` (editor + diff) and `@tectra-ng/code-editor/highlight` (tokenizers, `highlightCode`, the static `tx-code-highlight` view — no engine import, usable on its own).

**Every item also needs** (not repeated below): README API tables, docs page (category `Code`, `source:` / `package:` front matter) with an example per feature built from kit components, unit tests, server rendering safe, texts from `@tectra-ng/core/i18n` in every locale, e2e only where the browser shows something the unit test cannot, lint clean.

---

## 14.0 Package ✅

- [x] `@tectra-ng/code-editor`: `project.json` (`build`, `test`, tag `pkg:code-editor`), `package.json` (peers on `@tectra-ng/*` and Angular, `@codemirror/state` + `@codemirror/view` as dependencies, `publishConfig`), `ng-package.json` (`allowedNonPeerDependencies`), `tsconfig.base.json` paths, module boundary (`pkg:code-editor` → ui and below; `blocks` may use it), `build:packages` / `test` scripts, `release.projects`, part of `tectra-ng`, install docs (root README, `packages/tectra-ng/README.md`, `INSTALL_PACKAGES`), docs category `Code`

## 14.1 Highlighting — `code-editor/highlight` ✅

- [x] Own line-based tokenizers with a state carried between lines: HTML (with `<script>` / `<style>` inside), CSS, JavaScript, TypeScript, JSON, Markdown (with fenced code), plain text
- [x] Token classes of the Monaco themes (keyword, string, number, comment, regexp, type, tag, attribute name / value, delimiter, JSON key, CSS property, Markdown heading / emphasis / link / code); colours as component tokens, the Monaco light and dark palettes by default
- [x] `highlightCode(code, language)` → lines of tokens; `tx-code-highlight` — a static, server-rendered view with line numbers

## 14.2 Editor — `tx-code-editor` ✅

- [x] `value` (two-way) / `valueChange` and `codeChanged` (the first app's name), `language` (`'html'` by default), `height` (`'600px'` by default, `'100%'` fills the parent), `readOnly`, `lineNumbers`, `wordWrap` (on by default, wrapped rest keeps the indent), `indentGuides` (on by default, as in Monaco), `tabSize` (taken from the text when not set), `placeholder`, `ariaLabel`; font size 14, the Monaco line height
- [x] Works with forms: `formControl`, `ngModel`, disabled, invalid border from the control, touched on blur
- [x] Editing: undo / redo with grouping, Tab / Shift+Tab indent, Enter keeps the indent (one more after an opening bracket or tag), auto-close of brackets, quotes and HTML tags, toggle comment (Ctrl/⌘+/), duplicate, move and delete lines, active line, bracket matching
- [x] Search and replace in the kit look: Ctrl/⌘+F, Ctrl/⌘+H (⌥⌘F on macOS), match case, whole word, regular expression, "3 of 12", next / previous, replace one / all, matches highlighted
- [x] Server rendering: the static highlighted view on the server with the same size and line numbers, the editor after hydration with no layout shift
- [x] `dt`, `pt`, `ptOptions`, `unstyled`; frame tokens (border, radius, background) from the first app; light / dark from the tokens

## 14.3 Diff — `tx-code-diff` ✅

- [x] Own line diff (Myers) with changed characters inside a line pair
- [x] `original` → `value`; `view: 'inline' | 'split'` (inline by default, as the first app); removed and added lines and characters marked with the Monaco diff colours, two line number columns inline
- [x] Scrolls to the first change, `changes` output with the counts, read-only or an editable modified side (`valueChange`)
- [x] `tx-code-editor` `diffMode` + `originalValue` render the inline diff (drop-in for the first app)
- [x] Inside changed lines the syntax colours are mixed with the text colour (`codeDiff.syntax.mix`) so they keep WCAG AA contrast on the diff backgrounds
- [x] The first-change scroll moves only the diff's own scroller, never the page
