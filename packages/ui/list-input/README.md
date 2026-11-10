# ListInput

A textarea for pasting many values at once — domains, links, emails, ids. It parses the text as you type, counts the items, duplicates and lines it does not recognize, and offers "Clean up" (one item per line, without duplicates and invalid lines) and "Clear". The value is the parsed array, so send that to the server, not the raw text.

```html
<tx-list-input type="domain" [formControl]="domains" />
```

## Inputs
| Name | Description |
|---|---|
| text | Raw text of the field. Two-way: `[(text)]`. Setting it does not emit `itemsChange` |
| type | Built-in parser: `domain` (host of a domain or URL, lower case), `email`, `url` (adds a missing `https://`), `text` (any non-empty token) |
| parser | Own parser, a `TxListInputParser`: gets one token and returns the normalized item, or `null` when it is not recognized. Replaces `type` |
| splitByLines | Splits only by new lines, commas and semicolons, so a line with spaces stays one item. By default spaces split too |
| separator | Own separator as a `RegExp`; replaces `splitByLines` |
| placeholder | Placeholder; a translated one for the `type` by default |
| hint | Footer text while the field is empty; a translated one for the `type` by default |
| countLabel | Text of the items counter, with `{count}` and plural forms: `{count, plural, one {# id} other {# ids}}` |
| rows | Visible rows of the textarea |
| invalidLimit | How many unrecognized tokens are listed under the field before "+N more" |
| disabled | Disables the field and its actions (also from the form control) |
| readonly | The text cannot be changed; the actions are hidden |
| invalid | Error look; from the form control when not set |
| inputId | Id of the textarea, for a `<label for>` |
| ariaLabel | Accessible name of the textarea when there is no label |
| ariaLabelledBy | Id of the element that names the textarea |
| dt | Design tokens of this instance (`listInput`) |
| pt | Classes and styles of the parts: `root`, `field`, `footer`, `stats`, `actions`, `invalid` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemsChange | The unique recognized items after every edit, "Clean up" and "Clear" |
| parsedChange | `{ items, invalid, duplicates }` after every edit, "Clean up" and "Clear" |

## Methods
| Name | Description |
|---|---|
| cleanUp | Rewrites the text to one recognized item per line, without duplicates |
| clear | Empties the text |

## Parsers
`txParseList(text, parser, separator)` parses a text without the component and returns `{ items, invalid, duplicates }`. The built-in parsers are exported too: `txParseDomain`, `txParseEmail`, `txParseUrl`, `txParseText` (all in `TX_LIST_INPUT_PARSERS`), with the separators `TX_LIST_INPUT_WORDS` and `TX_LIST_INPUT_LINES`.

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves from the field to "Clean up" and "Clear" |
| Enter / Space | On a button: runs its action and returns focus to the field |
