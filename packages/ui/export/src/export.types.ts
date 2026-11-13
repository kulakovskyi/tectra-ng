/** One row of data to export: an object with the values by key. */
export type TxExportRow = Record<string, unknown>;

/**
 * File or action an export produces: `csv`, `excel`, `word`, `pdf`, `json`, `html`, `markdown`, `copy` or `print`.
 */
export type TxExportFormat = 'csv' | 'excel' | 'word' | 'pdf' | 'json' | 'html' | 'markdown' | 'copy' | 'print';

/** Alignment of a column: `start`, `center` or `end`. */
export type TxExportAlign = 'start' | 'center' | 'end';

/** How a column's values are written: `text`, `number`, `date`, `datetime` or `boolean`. */
export type TxExportValueType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

/** Page orientation: `portrait`, `landscape`, or `auto` (landscape above five columns). */
export type TxExportOrientation = 'auto' | 'portrait' | 'landscape';

/** Page size: `a3`, `a4`, `a5`, `letter`, `legal` or `[width, height]` in points. */
export type TxExportPageSize = 'a3' | 'a4' | 'a5' | 'letter' | 'legal' | readonly [number, number];

/** Names of the parts of the export buttons that `pt` can style. */
export type TxExportPart = 'root' | 'button';

/** One column of an export: which value to read and how to write it. */
export interface TxExportField<T = TxExportRow> {
  /** Key of the value in a row, or a path like `team.title`. */
  field: string;
  /** Column title; the `field` when not set. */
  title?: string;
  /** Computes the value from the read value, the row and its index instead of using the value as it is. */
  aggregator?: (value: unknown, row: T, index: number) => unknown;
  /** How the values are written; guessed from the values when not set. */
  type?: TxExportValueType;
  /** Column width in characters. */
  width?: number;
  /** Alignment of the column; numbers end, booleans center and the rest start by default. */
  align?: TxExportAlign;
  /** Excel number or date format, such as `#,##0.00` or `dd.mm.yyyy`. */
  format?: string;
  /** Takes the column only in these formats; every format when not set. */
  formats?: readonly TxExportFormat[];
}

/** A column of the table to export, with its type and alignment resolved. */
export interface TxExportColumn {
  /** The `field` the column was read from. */
  key: string;
  /** Column title. */
  title: string;
  /** How the values are written. */
  type: TxExportValueType;
  /** Column width in characters. */
  width?: number;
  /** Alignment of the column. */
  align: TxExportAlign;
  /** Excel number or date format of the column. */
  format?: string;
}

/** The data an export writes: columns and the rows of values in the same order. */
export interface TxExportTable {
  /** The columns in order. */
  columns: TxExportColumn[];
  /** One list of values per row, one value per column. */
  rows: unknown[][];
}

/** Options shared by documents that have a heading: the title, subtitle, date and the header row. */
export interface TxExportDocumentOptions {
  /** Title at the top of the document. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Shows the date and time of the export under the title. */
  showDate?: boolean;
  /** Shows the row of column titles (default on). */
  header?: boolean;
}

/** Options of paged documents (Word and PDF): page, text and table look. */
export interface TxExportPageOptions extends TxExportDocumentOptions {
  /** Page size (default `a4`). */
  pageSize?: TxExportPageSize;
  /** Page orientation (default `auto`). */
  orientation?: TxExportOrientation;
  /** Page margin in points: one number, or `[top, right, bottom, left]` (default 36). */
  margin?: number | readonly [number, number, number, number];
  /** Text size in points (default 10 in Word, 9 in PDF). */
  fontSize?: number;
  /** Shows page numbers at the bottom (default on). */
  pageNumbers?: boolean;
  /** Repeats the header row on every page (default on). */
  repeatHeader?: boolean;
  /** Shades every second row (default off). */
  striped?: boolean;
  /** Draws lines between cells; `false` keeps only horizontal lines (default on). */
  gridlines?: boolean;
  /** Background colour of the header row, as hex. */
  headerBackground?: string;
  /** Background colour of shaded rows, as hex. */
  stripeBackground?: string;
  /** Colour of the table lines, as hex. */
  borderColor?: string;
  /** Colour of the text, as hex. */
  textColor?: string;
  /** Colour of the subtitle, date and page numbers, as hex. */
  mutedColor?: string;
}

/** Font files for the PDF export. */
export interface TxExportFont {
  /** TrueType file of the regular weight: its bytes, or a base64 string. */
  regular: ArrayBuffer | Uint8Array | string;
  /** TrueType file of the bold weight; the regular one is emulated when not set. */
  bold?: ArrayBuffer | Uint8Array | string;
}

/** Options of the CSV file. */
export interface TxExportCsvOptions {
  /** Text between cells (default `,`). */
  separator?: string;
  /** Starts the file with a byte order mark so spreadsheet apps read non-Latin text (default on). */
  bom?: boolean;
  /** Line ending: `\r\n` (default) or `\n`. */
  lineEnding?: '\r\n' | '\n';
  /** Writes the row of column titles (default on). */
  header?: boolean;
  /** Quotes every cell, not only the ones that need it. */
  quoteAll?: boolean;
  /** Puts a quote before cells a spreadsheet would run as a formula (default on). */
  formulaGuard?: boolean;
}

/** Options of the Excel `.xlsx` file. */
export interface TxExportExcelOptions {
  /** Name of the worksheet (default `Sheet1`). */
  sheetName?: string;
  /** Writes the row of column titles (default on). */
  header?: boolean;
  /** Keeps the header row in view when scrolling (default on). */
  freezeHeader?: boolean;
  /** Adds filter arrows to the header row (default on). */
  autoFilter?: boolean;
  /** Sizes columns to their content (default on). */
  autoWidth?: boolean;
  /** Smallest automatic column width in characters (default 8). */
  minWidth?: number;
  /** Largest automatic column width in characters (default 60). */
  maxWidth?: number;
  /** Writes the header in bold (default on). */
  headerBold?: boolean;
  /** Background of the header row as hex, or `none`. */
  headerBackground?: string;
  /** Text colour of the header row as hex. */
  headerColor?: string;
  /** Wraps cells that hold line breaks (default on). */
  wrapText?: boolean;
  /** Excel number format for number columns without their own `format`. */
  numberFormat?: string;
  /** Excel format for date columns without their own `format`. */
  dateFormat?: string;
  /** Excel format for date and time columns without their own `format`. */
  dateTimeFormat?: string;
  /** Title stored in the file properties. */
  title?: string;
  /** Author stored in the file properties. */
  author?: string;
  /** Compresses the file (default on). */
  compress?: boolean;
}

/** Options of the Word `.docx` file. */
export interface TxExportWordOptions extends TxExportPageOptions {
  /** Compresses the file (default on). */
  compress?: boolean;
}

/** Options of the PDF file. */
export interface TxExportPdfOptions extends TxExportPageOptions {
  /** Loads the TrueType font; the Onest font of `@tectra-ng/ui/export-font` when not set. */
  font?: () => Promise<TxExportFont>;
  /** Line height as a multiple of the font size (default 1.35). */
  lineHeight?: number;
  /** Space inside a cell in points (default 4). */
  cellPadding?: number;
  /** Author stored in the file properties. */
  author?: string;
  /** Compresses the file (default on). */
  compress?: boolean;
}

/** Options of the JSON file. */
export interface TxExportJsonOptions {
  /** Which names the objects use as keys: the `field` (default) or the column `title`. */
  keys?: 'field' | 'title';
  /** Spaces of indentation (default 2). */
  indent?: number;
}

/** Options of the HTML file. */
export interface TxExportHtmlOptions extends TxExportDocumentOptions {
  /** Own CSS added to the page. */
  styles?: string;
}

/** Options of the Markdown file. */
export interface TxExportMarkdownOptions {
  /** Heading above the table. */
  title?: string;
  /** Writes the row of column titles (default on). */
  header?: boolean;
}

/** Options of copying to the clipboard. */
export interface TxExportCopyOptions {
  /** Copies the row of column titles (default on). */
  header?: boolean;
  /** Also puts an HTML table on the clipboard so it pastes as a table (default on). */
  html?: boolean;
}

/** Options of printing. */
export interface TxExportPrintOptions extends TxExportDocumentOptions {
  /** Page size of the print (default `a4`). */
  pageSize?: TxExportPageSize;
  /** Page orientation of the print (default `auto`). */
  orientation?: TxExportOrientation;
  /** Page margin in points: one number, or `[top, right, bottom, left]`. */
  margin?: number | readonly [number, number, number, number];
  /** Own CSS added to the printed page. */
  styles?: string;
}

/** Options of an export: names and texts shared by every format, and one object per format. */
export interface TxExportOptions {
  /** File name, with or without the extension (default `ExportedData`). */
  filename?: string;
  /** Title of the document, and of the Excel file. */
  title?: string;
  /** Line under the title. */
  subtitle?: string;
  /** Shows the date and time of the export under the title. */
  showDate?: boolean;
  /** Locale for dates in the file; the tectra locale when not set. */
  locale?: string;
  /** Options of the CSV file. */
  csv?: TxExportCsvOptions;
  /** Options of the Excel file. */
  excel?: TxExportExcelOptions;
  /** Options of the Word file. */
  word?: TxExportWordOptions;
  /** Options of the PDF file. */
  pdf?: TxExportPdfOptions;
  /** Options of the JSON file. */
  json?: TxExportJsonOptions;
  /** Options of the HTML file. */
  html?: TxExportHtmlOptions;
  /** Options of the Markdown file. */
  markdown?: TxExportMarkdownOptions;
  /** Options of copying to the clipboard. */
  copy?: TxExportCopyOptions;
  /** Options of printing. */
  print?: TxExportPrintOptions;
}

/** Loads the rows to export when the button is clicked; `null` or nothing cancels the export. */
export type TxExportFetch<T = TxExportRow> = () => Promise<readonly T[] | null | undefined>;

/** What `TxExportService.export` runs: the format, the rows, the fields and the options. */
export interface TxExportRequest<T = TxExportRow> {
  /** Format to produce. */
  format: TxExportFormat;
  /** Rows to export. */
  rows: readonly T[];
  /** Columns in order. */
  fields: readonly TxExportField<T>[];
  /** Options merged over the defaults from `provideTxExport`. */
  options?: TxExportOptions;
}

/** What an export did. */
export interface TxExportResult {
  /** Format that was produced. */
  format: TxExportFormat;
  /** Name of the saved file; `null` for copy and print. */
  filename: string | null;
  /** Number of rows written. */
  rows: number;
}

/** Payload of `exported`: the result and the rows that were exported. */
export interface TxExportedEvent<T = TxExportRow> extends TxExportResult {
  /** The rows that were exported. */
  data: readonly T[];
}
