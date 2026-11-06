import { csvCell, downloadCsv } from '@tectra-ng/ui/export';
import { TxTableColumn } from './table.types';
import { columnLabel, resolveField } from './table.utils';

export interface TxCsvOptions<T> {
  separator?: string;
  header?: boolean;
  value?: (row: T, column: TxTableColumn) => unknown;
}

export function toCsv<T>(rows: readonly T[], columns: readonly TxTableColumn[], options: TxCsvOptions<T> = {}): string {
  const separator = options.separator ?? ',';
  const read = options.value ?? ((row: T, column: TxTableColumn) => resolveField(row, column.field));
  const lines = rows.map((row) => columns.map((column) => csvCell(read(row, column), separator)).join(separator));
  if (options.header !== false) lines.unshift(columns.map((column) => csvCell(columnLabel(column), separator)).join(separator));
  return lines.join('\r\n');
}

export { csvCell, downloadCsv };
