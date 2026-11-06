import { TxTableColumn } from './table.types';
import { columnLabel, resolveField } from './table.utils';

export interface TxCsvOptions<T> {
  separator?: string;
  header?: boolean;
  value?: (row: T, column: TxTableColumn) => unknown;
}

const FORMULA = /^[=+\-@\t\r]/;
const NUMBER = /^[+-]?\d+([.,]\d+)?$/;

export function csvCell(value: unknown, separator = ','): string {
  if (value === null || value === undefined) return '';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (FORMULA.test(text) && text.length > 1 && !NUMBER.test(text)) text = `'${text}`;
  return /["\r\n]/.test(text) || text.includes(separator) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv<T>(rows: readonly T[], columns: readonly TxTableColumn[], options: TxCsvOptions<T> = {}): string {
  const separator = options.separator ?? ',';
  const read = options.value ?? ((row: T, column: TxTableColumn) => resolveField(row, column.field));
  const lines = rows.map((row) => columns.map((column) => csvCell(read(row, column), separator)).join(separator));
  if (options.header !== false) lines.unshift(columns.map((column) => csvCell(columnLabel(column), separator)).join(separator));
  return lines.join('\r\n');
}

export function downloadCsv(document: Document, csv: string, filename: string): void {
  const view = document.defaultView;
  if (!view?.URL?.createObjectURL) return;
  const url = view.URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  view.setTimeout(() => view.URL.revokeObjectURL(url));
}
