import { TxExportAlign, TxExportColumn, TxExportField, TxExportFormat, TxExportTable, TxExportValueType } from './export.types';

const FORMULA = /^[=+\-@\t\r]/;
const NUMBER = /^[+-]?\d+([.,]\d+)?$/;
const INDEX_FIELDS = new Set(['number', 'place']);

export function readExportField(row: unknown, field: string): unknown {
  if (row === null || row === undefined) return undefined;
  const record = row as Record<string, unknown>;
  if (field in record) return record[field];
  return field.split('.').reduce<unknown>((value, key) => (value === null || value === undefined ? undefined : (value as Record<string, unknown>)[key]), row);
}

export function fieldsFor<T>(fields: readonly TxExportField<T>[], format?: TxExportFormat): TxExportField<T>[] {
  return fields.filter((field) => !format || !field.formats || field.formats.includes(format));
}

export function exportMatrix<T>(rows: readonly T[], fields: readonly TxExportField<T>[], format?: TxExportFormat): unknown[][] {
  const table = buildExportTable(rows, fields, format);
  return [table.columns.map((column) => column.title), ...table.rows];
}

export function buildExportTable<T>(rows: readonly T[], fields: readonly TxExportField<T>[], format?: TxExportFormat): TxExportTable {
  const used = fieldsFor(fields, format);
  const body = rows.map((row, index) =>
    used.map(({ field, aggregator }) => {
      const value = readExportField(row, field);
      if (aggregator) return aggregator(value, row, index);
      return INDEX_FIELDS.has(field) ? index + 1 : value;
    }),
  );
  const columns = used.map<TxExportColumn>((field, column) => {
    const type = field.type ?? inferType(body.map((row) => row[column]));
    return {
      key: field.field,
      title: field.title || field.field,
      type,
      width: field.width,
      align: field.align ?? defaultAlign(type),
      format: field.format,
    };
  });
  return { columns, rows: body };
}

export function inferType(values: readonly unknown[]): TxExportValueType {
  const present = values.filter((value) => value !== null && value !== undefined && value !== '');
  if (!present.length) return 'text';
  if (present.every((value) => typeof value === 'number' && Number.isFinite(value))) return 'number';
  if (present.every((value) => typeof value === 'boolean')) return 'boolean';
  if (present.every((value) => value instanceof Date && !Number.isNaN(value.getTime()))) {
    return present.some((value) => hasTime(value as Date)) ? 'datetime' : 'date';
  }
  return 'text';
}

function defaultAlign(type: TxExportValueType): TxExportAlign {
  if (type === 'number') return 'end';
  if (type === 'boolean') return 'center';
  return 'start';
}

function hasTime(date: Date): boolean {
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0 || date.getMilliseconds() !== 0;
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export interface TxExportTextContext {
  locale?: string;
  yes: string;
  no: string;
}

export function cellText(value: unknown, column: TxExportColumn, context: TxExportTextContext): string {
  if (value === null || value === undefined) return '';
  if (column.type === 'boolean' && typeof value === 'boolean') return value ? context.yes : context.no;
  if (column.type === 'date' || column.type === 'datetime' || value instanceof Date) {
    const date = toDate(value);
    if (date) {
      return column.type === 'datetime' || (column.type !== 'date' && hasTime(date))
        ? date.toLocaleString(context.locale, { dateStyle: 'medium', timeStyle: 'short' })
        : date.toLocaleDateString(context.locale, { dateStyle: 'medium' });
    }
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function localIso(value: unknown, type: TxExportValueType): unknown {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');
  const day = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  if (type === 'date' || (type !== 'datetime' && !hasTime(value))) return day;
  return `${day} ${pad(value.getHours())}:${pad(value.getMinutes())}${value.getSeconds() ? `:${pad(value.getSeconds())}` : ''}`;
}

export function safeExportText(text: string): string {
  return FORMULA.test(text) && text.length > 1 && !NUMBER.test(text) ? `'${text}` : text;
}

export function csvCell(value: unknown, separator = ',', options: { quoteAll?: boolean; formulaGuard?: boolean } = {}): string {
  if (value === null || value === undefined) return options.quoteAll ? '""' : '';
  const raw = value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value);
  const text = options.formulaGuard === false ? raw : safeExportText(raw);
  return options.quoteAll || /["\r\n]/.test(text) || text.includes(separator) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function matrixToCsv(matrix: readonly (readonly unknown[])[], separator = ','): string {
  return matrix.map((row) => row.map((cell) => csvCell(cell, separator)).join(separator)).join('\r\n');
}

export function withExtension(filename: string, extension: string): string {
  return filename.toLowerCase().endsWith(`.${extension}`) ? filename : `${filename}.${extension}`;
}

export function downloadBlob(document: Document, blob: Blob, filename: string): void {
  const view = document.defaultView;
  if (!view?.URL?.createObjectURL) return;
  const url = view.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  view.setTimeout(() => view.URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(document: Document, csv: string, filename: string): void {
  downloadBlob(document, new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }), withExtension(filename, 'csv'));
}

export function escapeXml(text: string): string {
  return text
    .replace(/[^\t\n\r -퟿-�\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function hexColor(color: string | undefined, fallback: string): string {
  const value = (color ?? fallback).replace('#', '').trim();
  const full = value.length === 3 ? value.replace(/./g, (char) => char + char) : value;
  return /^[0-9a-f]{6}$/i.test(full) ? full.toUpperCase() : fallback.replace('#', '').toUpperCase();
}
