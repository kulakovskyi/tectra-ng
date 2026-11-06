import { TxSortMeta, TxTableActionConfig, TxTableColumn, TxTableRowKey } from './table.types';

export function resolveField(row: unknown, field: string | undefined): unknown {
  if (!field || row === null || row === undefined) return undefined;
  return field.split('.').reduce<unknown>((value, key) => (value === null || value === undefined ? undefined : (value as Record<string, unknown>)[key]), row);
}

export function writeField(row: unknown, field: string, value: unknown): void {
  const keys = field.split('.');
  const last = keys.pop();
  if (!last) return;
  const target = keys.reduce<unknown>((current, key) => (current === null || current === undefined ? undefined : (current as Record<string, unknown>)[key]), row);
  if (target !== null && typeof target === 'object') (target as Record<string, unknown>)[last] = value;
}

export function compareValues(a: unknown, b: unknown, locale?: string): number {
  if (a === b) return 0;
  if (a === null || a === undefined || a === '') return 1;
  if (b === null || b === undefined || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

export function sortRows<T>(rows: readonly T[], meta: readonly TxSortMeta[], locale?: string): T[] {
  if (!meta.length) return [...rows];
  return rows
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      for (const { field, order } of meta) {
        const result = compareValues(resolveField(left.row, field), resolveField(right.row, field), locale);
        if (result !== 0) {
          const emptyLeft = isEmpty(resolveField(left.row, field));
          const emptyRight = isEmpty(resolveField(right.row, field));
          return emptyLeft || emptyRight ? result : order === 'asc' ? result : -result;
        }
      }
      return left.index - right.index;
    })
    .map(({ row }) => row);
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function nextSortOrder(current: 'asc' | 'desc' | null): 'asc' | 'desc' | null {
  return current === 'asc' ? 'desc' : current === 'desc' ? null : 'asc';
}

export function rowKeyOf(row: unknown, dataKey: string | undefined, index: number): TxTableRowKey | unknown {
  if (!dataKey) return row ?? index;
  const key = resolveField(row, dataKey);
  return key === undefined ? index : key;
}

export function actionIdOf(config: TxTableActionConfig): string {
  return (
    config.id ??
    config.label
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
  );
}

export function pxOf(length: string | undefined): number | null {
  if (!length) return null;
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(length.trim());
  return match ? Number(match[1]) : null;
}

export function columnLabel(column: TxTableColumn): string {
  return column.header ?? column.field;
}

export function mergeColumnOrder(columns: readonly TxTableColumn[], order: readonly string[], visible: (field: string) => boolean): TxTableColumn[] {
  const byField = new Map(columns.map((column) => [column.field, column]));
  const restored = order.map((field) => byField.get(field)).filter((column): column is TxTableColumn => !!column);
  const result = [...restored];
  columns.forEach((column, index) => {
    if (restored.includes(column)) return;
    const next = columns.slice(index + 1).find((candidate) => restored.includes(candidate) && visible(candidate.field));
    const position = next ? result.indexOf(next) : result.length;
    result.splice(position, 0, column);
  });
  return result;
}
