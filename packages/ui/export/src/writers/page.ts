import { TxExportDocumentOptions, TxExportOrientation, TxExportPageSize, TxExportTable } from '../export.types';
import { TxExportTextContext } from '../export.utils';

const SIZES: Record<Exclude<TxExportPageSize, readonly [number, number]>, readonly [number, number]> = {
  a3: [841.89, 1190.55],
  a4: [595.28, 841.89],
  a5: [419.53, 595.28],
  letter: [612, 792],
  legal: [612, 1008],
};

export interface TxPageGeometry {
  width: number;
  height: number;
  margin: [number, number, number, number];
  landscape: boolean;
}

export function pageGeometry(
  size: TxExportPageSize | undefined,
  orientation: TxExportOrientation | undefined,
  margin: number | readonly [number, number, number, number] | undefined,
  columns: number,
): TxPageGeometry {
  const [short, long] = typeof size === 'object' ? [Math.min(...size), Math.max(...size)] : SIZES[size ?? 'a4'];
  const landscape = orientation === 'landscape' || (orientation !== 'portrait' && columns > 5);
  const edges = margin ?? 36;
  return {
    width: landscape ? long : short,
    height: landscape ? short : long,
    margin: typeof edges === 'number' ? [edges, edges, edges, edges] : [edges[0], edges[1], edges[2], edges[3]],
    landscape,
  };
}

export function dateLine(options: TxExportDocumentOptions, context: TxExportTextContext, date: Date): string | null {
  return options.showDate ? date.toLocaleString(context.locale, { dateStyle: 'medium', timeStyle: 'short' }) : null;
}

export function columnShares(table: TxExportTable, texts: readonly (readonly string[])[]): number[] {
  return table.columns.map((column, index) => {
    if (column.width) return column.width;
    const longest = Math.max(column.title.length, ...texts.slice(0, 500).map((row) => Math.max(...row[index].split('\n').map((line) => line.length))));
    return Math.min(40, Math.max(4, longest));
  });
}
