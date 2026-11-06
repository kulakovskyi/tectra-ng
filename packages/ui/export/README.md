# Export

Saves rows as a file in the browser — CSV, Excel (`.xlsx`), Word (`.docx`), PDF, JSON, HTML, Markdown — copies them as a table or prints them, without any third-party library. The Excel and Word files are written by the kit itself (zip + Office XML); the PDF embeds only the glyphs it uses from the Onest font (Latin and Cyrillic, loaded from `@tectra-ng/ui/export-font` on the first PDF export), so its text is real and searchable.

Each format has its own icon button — `<tx-export-csv>`, `<tx-export-excel>`, `<tx-export-word>`, `<tx-export-pdf>`, or `<tx-export-button format="…">` for any of them — and `<tx-export>` is one "Export" split button with a menu of formats. They all take the same `fields`, `data` / `fetchData` and `options`.

```html
<tx-export-excel [data]="users()" [fields]="exportFields" filename="users" />
<tx-export [fields]="exportFields" [fetchData]="loadAllUsers" title="Users" />
```

```ts
exportFields: TxExportField<User>[] = [
  { field: 'number', title: '#', width: 6 },
  { field: 'name', title: 'Name', width: 28 },
  { field: 'balance', title: 'Balance', type: 'number', format: '#,##0.00' },
  { field: 'createdAt', title: 'Created', type: 'date' },
  { field: 'notes', title: 'Notes', formats: ['excel', 'csv'] },
];
```

## Inputs
| Name | Description |
|---|---|
| data | Rows to export; two-way, replaced by the result of `fetchData` |
| fields | Columns in order (`TxExportField`): `field` (a key or a path like `team.title`), `title`, `aggregator(value, row, index)`, `type` (`text`, `number`, `date`, `datetime`, `boolean`; guessed from the values), `width` (in characters, all formats), `align` (`start`, `center`, `end`), `format` (Excel number format such as `#,##0.00` or `dd.mm.yyyy`), `formats` (only in these formats). A `number` or `place` field without an aggregator gets the row number |
| fetchData | `() => Promise<rows \| null>` called on click before the export, e.g. to load every page from the server; `null` cancels |
| options | `TxExportOptions` — `filename`, `title`, `subtitle`, `showDate`, `locale` and one object per format: `csv`, `excel`, `word`, `pdf`, `json`, `html`, `markdown`, `copy`, `print` (see below); merged over `provideTxExport()` |
| filename | File name, with or without the extension; `ExportedData` by default |
| title | Title of the PDF, Word, HTML and printed documents and of the Excel file |
| format | `tx-export-button` — `csv`, `excel`, `word`, `pdf`, `json`, `html`, `markdown`, `copy` or `print` |
| formats | `tx-export` — formats in the menu, in order; the main button runs the first one |
| loading | Shows the spinner; the button also spins by itself while an export runs |
| disabled | Disables the button |
| label | Text of the button; empty shows an icon-only button named by the tooltip (`tx-export` shows "Export") |
| tooltip | Own tooltip; defaults to the translated "Export to CSV", "Copy table"… |
| severity | Button severity |
| variant | Button variant: `outlined`, `text` or `link` |
| size | Button size |
| pt | Classes and styles of the parts: `root`, `button` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles of the button |

## Outputs
| Name | Description |
|---|---|
| exported | Done: `{ format, filename, rows, data }` (`filename` is `null` for copy and print) |
| failed | `fetchData`, the writer or the clipboard threw; the button is ready for the next click |
| dataChange | The rows changed after `fetchData` |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Runs the export of the focused button |
| Alt + ArrowDown | `tx-export` — opens the menu of formats (see split button) |

## Options per format

| Format | Options |
|---|---|
| csv | `separator` (`,`), `bom` (true — spreadsheet apps read non-Latin text), `lineEnding` (`\r\n`), `header`, `quoteAll`, `formulaGuard` (true — cells starting with `=`, `+`, `-`, `@` get a leading `'`; signed numbers stay) |
| excel | `sheetName`, `header`, `freezeHeader`, `autoFilter`, `autoWidth`, `minWidth` / `maxWidth` (characters), `headerBold`, `headerBackground` / `headerColor` (hex or `none`), `wrapText`, `numberFormat`, `dateFormat`, `dateTimeFormat`, `title`, `author`, `compress` |
| word, pdf | `title`, `subtitle`, `showDate`, `header`, `pageSize` (`a3`, `a4`, `a5`, `letter`, `legal` or `[width, height]` in points), `orientation` (`auto` — landscape above 5 columns, `portrait`, `landscape`), `margin` (points or `[top, right, bottom, left]`), `fontSize`, `pageNumbers`, `repeatHeader`, `striped`, `gridlines`, `headerBackground`, `stripeBackground`, `borderColor`, `textColor`, `mutedColor`, `compress`; PDF also `font` (own TrueType loader), `lineHeight`, `cellPadding`, `author` |
| json | `keys` (`field` or `title`), `indent` |
| html | `title`, `subtitle`, `showDate`, `header`, `styles` (own CSS) |
| markdown | `title`, `header` |
| copy | `header`, `html` (also puts an HTML table on the clipboard so it pastes as a table) |
| print | `title`, `subtitle`, `showDate`, `header`, `pageSize`, `orientation`, `margin`, `styles` |

`provideTxExport(options)` sets defaults for the app or for one component subtree.

## Accessibility

Icon-only buttons are named by their tooltip. While an export runs the button spins, has `aria-busy` and ignores more clicks. After copying, the button shows a check, its name becomes "Table copied" and the text is announced.

## Notes

- `TxExportService.export({ format, rows, fields, options })` runs an export from code; `buildExportTable`, `writeCsv`, `writeXlsx`, `writeDocx`, `writePdf`, `writeJson`, `writeHtml`, `writeMarkdown` and `zip` are exported for own flows. `tx-table` `exportCSV()` uses the same CSV writer.
- PDF uses a TrueType font without shaping, so scripts that need it (Arabic, Indic) need their own font through `pdf.font`, and right-to-left text is not reordered.
