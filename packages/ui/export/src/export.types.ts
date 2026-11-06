export type TxExportRow = Record<string, unknown>;

export type TxExportFormat = 'csv' | 'excel' | 'word' | 'pdf' | 'json' | 'html' | 'markdown' | 'copy' | 'print';

export type TxExportAlign = 'start' | 'center' | 'end';

export type TxExportValueType = 'text' | 'number' | 'date' | 'datetime' | 'boolean';

export type TxExportOrientation = 'auto' | 'portrait' | 'landscape';

export type TxExportPageSize = 'a3' | 'a4' | 'a5' | 'letter' | 'legal' | readonly [number, number];

export type TxExportPart = 'root' | 'button';

export interface TxExportField<T = TxExportRow> {
  field: string;
  title?: string;
  aggregator?: (value: unknown, row: T, index: number) => unknown;
  type?: TxExportValueType;
  width?: number;
  align?: TxExportAlign;
  format?: string;
  formats?: readonly TxExportFormat[];
}

export interface TxExportColumn {
  key: string;
  title: string;
  type: TxExportValueType;
  width?: number;
  align: TxExportAlign;
  format?: string;
}

export interface TxExportTable {
  columns: TxExportColumn[];
  rows: unknown[][];
}

export interface TxExportDocumentOptions {
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  header?: boolean;
}

export interface TxExportPageOptions extends TxExportDocumentOptions {
  pageSize?: TxExportPageSize;
  orientation?: TxExportOrientation;
  margin?: number | readonly [number, number, number, number];
  fontSize?: number;
  pageNumbers?: boolean;
  repeatHeader?: boolean;
  striped?: boolean;
  gridlines?: boolean;
  headerBackground?: string;
  stripeBackground?: string;
  borderColor?: string;
  textColor?: string;
  mutedColor?: string;
}

export interface TxExportFont {
  regular: ArrayBuffer | Uint8Array | string;
  bold?: ArrayBuffer | Uint8Array | string;
}

export interface TxExportCsvOptions {
  separator?: string;
  bom?: boolean;
  lineEnding?: '\r\n' | '\n';
  header?: boolean;
  quoteAll?: boolean;
  formulaGuard?: boolean;
}

export interface TxExportExcelOptions {
  sheetName?: string;
  header?: boolean;
  freezeHeader?: boolean;
  autoFilter?: boolean;
  autoWidth?: boolean;
  minWidth?: number;
  maxWidth?: number;
  headerBold?: boolean;
  headerBackground?: string;
  headerColor?: string;
  wrapText?: boolean;
  numberFormat?: string;
  dateFormat?: string;
  dateTimeFormat?: string;
  title?: string;
  author?: string;
  compress?: boolean;
}

export interface TxExportWordOptions extends TxExportPageOptions {
  compress?: boolean;
}

export interface TxExportPdfOptions extends TxExportPageOptions {
  font?: () => Promise<TxExportFont>;
  lineHeight?: number;
  cellPadding?: number;
  author?: string;
  compress?: boolean;
}

export interface TxExportJsonOptions {
  keys?: 'field' | 'title';
  indent?: number;
}

export interface TxExportHtmlOptions extends TxExportDocumentOptions {
  styles?: string;
}

export interface TxExportMarkdownOptions {
  title?: string;
  header?: boolean;
}

export interface TxExportCopyOptions {
  header?: boolean;
  html?: boolean;
}

export interface TxExportPrintOptions extends TxExportDocumentOptions {
  pageSize?: TxExportPageSize;
  orientation?: TxExportOrientation;
  margin?: number | readonly [number, number, number, number];
  styles?: string;
}

export interface TxExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  locale?: string;
  csv?: TxExportCsvOptions;
  excel?: TxExportExcelOptions;
  word?: TxExportWordOptions;
  pdf?: TxExportPdfOptions;
  json?: TxExportJsonOptions;
  html?: TxExportHtmlOptions;
  markdown?: TxExportMarkdownOptions;
  copy?: TxExportCopyOptions;
  print?: TxExportPrintOptions;
}

export type TxExportFetch<T = TxExportRow> = () => Promise<readonly T[] | null | undefined>;

export interface TxExportRequest<T = TxExportRow> {
  format: TxExportFormat;
  rows: readonly T[];
  fields: readonly TxExportField<T>[];
  options?: TxExportOptions;
}

export interface TxExportResult {
  format: TxExportFormat;
  filename: string | null;
  rows: number;
}

export interface TxExportedEvent<T = TxExportRow> extends TxExportResult {
  data: readonly T[];
}
