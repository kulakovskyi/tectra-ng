import { TxBandScale, TxContinuousScale, TxStackedValue, seriesColor } from '@tectra-ng/charts/core';
import { TxComboChartBar } from './combo-chart.types';

/** Everything `comboBars` needs to lay the columns out: scales, series values and grouping settings. */
export interface TxComboBarsInput {
  /** Category scale. */
  band: TxBandScale;
  /** Value scales: the main one first, then the second axis. */
  scales: readonly TxContinuousScale[];
  /** Index into `scales` for every series: 0 for the main axis, 1 for the second. */
  axes: readonly number[];
  /** Stacks the columns of each axis instead of placing them side by side. */
  stacked: boolean;
  /** Share of the category band the columns of one category take (0.05 to 1). */
  widthRatio: number;
  /** Gap in px between grouped columns of one category. */
  groupGap: number;
  /** Values per series and category; `null` for a gap. */
  values: readonly (readonly (number | null)[])[];
  /** Start and end of each value in a stack, per series and category. */
  stackedValues: readonly TxStackedValue[][];
  /** Indexes of the visible series drawn as columns. */
  columns: readonly number[];
  /** Own colors per series; the palette fills the gaps. */
  colors: readonly (string | undefined)[];
}

function baseOf(scale: TxContinuousScale): number {
  const [d0, d1] = scale.domain;
  return d0 > 0 ? d0 : d1 < 0 ? d1 : 0;
}

/**
 * Assigns each column series the slot it occupies in a category: its own when grouped, one per axis when stacked.
 */
export function comboSlots(columns: readonly number[], axes: readonly number[], stacked: boolean): Map<number, number> {
  const slots = new Map<number, number>();
  if (!stacked) {
    columns.forEach((series, slot) => slots.set(series, slot));
    return slots;
  }
  const used = [...new Set(columns.map((series) => axes[series] ?? 0))];
  columns.forEach((series) => slots.set(series, used.indexOf(axes[series] ?? 0)));
  return slots;
}

/** Lays out the columns of a combo chart, grouped or stacked per axis. */
export function comboBars(input: TxComboBarsInput): TxComboChartBar[] {
  const { band, columns, stacked } = input;
  const slots = comboSlots(columns, input.axes, stacked);
  const slotCount = Math.max(1, new Set(slots.values()).size);
  const group = band.bandwidth * Math.min(1, Math.max(0.05, input.widthRatio));
  const slotSize = (group - input.groupGap * (slotCount - 1)) / slotCount;
  const outermost = new Map<string, number>();

  if (stacked) {
    for (const series of columns) {
      input.stackedValues[series]?.forEach((entry, index) => {
        if (!entry || entry[0] === entry[1]) return;
        outermost.set(`${slots.get(series)}:${index}:${entry[1] > entry[0] ? 1 : -1}`, series);
      });
    }
  }

  const bars: TxComboChartBar[] = [];
  for (const series of columns) {
    const scale = input.scales[input.axes[series] ?? 0] ?? input.scales[0];
    const slot = slots.get(series) ?? 0;
    (input.values[series] ?? []).forEach((raw, index) => {
      if (raw === null || raw === undefined) return;
      const [from, to] = stacked ? (input.stackedValues[series]?.[index] ?? [0, 0]) : [baseOf(scale), raw];
      if (from === to) return;
      const a = scale.map(from);
      const b = scale.map(to);
      const positive = to >= from;
      const isEnd = stacked ? outermost.get(`${slot}:${index}:${positive ? 1 : -1}`) === series : true;
      bars.push({
        key: `${series}:${index}`,
        series,
        index,
        x: band.center(index) - group / 2 + slot * (slotSize + input.groupGap),
        y: Math.min(a, b),
        width: slotSize,
        height: Math.abs(b - a),
        color: seriesColor(input.colors[series], series),
        end: isEnd ? (positive ? 'top' : 'bottom') : null,
        dir: positive ? 'up' : 'down',
      });
    });
  }
  return bars;
}
