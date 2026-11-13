import { TxHeatmapCell, TxHeatmapColumnGroup, TxHeatmapRow, TxHeatmapRowGroup, TxHeatmapScale } from './heatmap.types';

/** Splits the cells of a row into the column bands, one slot per column. */
export function heatmapRowGroups(cells: readonly (TxHeatmapCell | null)[], groups: readonly TxHeatmapColumnGroup[]): TxHeatmapRowGroup[] {
  let offset = 0;
  return groups.map((group) => {
    const slots = group.columns.map((column, index) => ({ columnKey: column.key, cell: cells[offset + index] ?? null }));
    offset += group.columns.length;
    return { key: group.key, slots };
  });
}

/**
 * Builds the color scale from the values of all cells; `min` and `max` override the found range and `steps` is at least 1.
 */
export function heatmapScale(rows: readonly TxHeatmapRow[], steps: number, min?: number, max?: number): TxHeatmapScale {
  let low = Infinity;
  let high = -Infinity;
  for (const row of rows) {
    for (const cell of row.cells) {
      const value = cell?.value;
      if (typeof value === 'number' && Number.isFinite(value)) {
        low = Math.min(low, value);
        high = Math.max(high, value);
      }
    }
  }
  return {
    min: min ?? (Number.isFinite(low) ? Math.min(low, 0) : 0),
    max: max ?? (Number.isFinite(high) ? high : 0),
    steps: Math.max(1, Math.round(steps)),
  };
}

/** Color level of a value from 0 (empty) to 1 (full), in `steps` equal parts of the scale. */
export function heatmapLevel(value: number | null | undefined, scale: TxHeatmapScale): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= scale.min) {
    return 0;
  }
  const span = scale.max - scale.min;
  const ratio = span > 0 ? Math.min(1, (value - scale.min) / span) : 1;
  return Math.max(1, Math.ceil(ratio * scale.steps)) / scale.steps;
}

/** Accessible name of a cell: its `ariaLabel`, else its tooltip, else `null`. */
export function heatmapCellLabel(cell: TxHeatmapCell): string | null {
  return cell.ariaLabel || cell.tooltip || null;
}
