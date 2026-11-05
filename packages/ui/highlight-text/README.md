# Highlight text

Marks every match of a search in a text — ignoring case and accents, for one or several terms. Matches are `<mark>` elements, so screen readers can report them; the text is never parsed as HTML.

```html
<tx-highlight-text [text]="row.name" [highlight]="search()" />
```

`highlightParts(text, terms)` returns the same split as an array of `{ text, match }` for own markup.

## Inputs
| Name | Description |
|---|---|
| text | The text (a number is shown as text) |
| highlight | A term or a list of terms to mark; empty marks nothing |
| caseSensitive | Matches the case exactly |
| dt | Design tokens of this instance (`highlightText`) |
| pt | Classes and styles of the parts: `root`, `mark` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |
