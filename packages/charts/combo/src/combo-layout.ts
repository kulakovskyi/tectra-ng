import { TxBandScale, TxContinuousScale, TxStackedValue, seriesColor } from '@tectra-ng/charts/core';
import { TxComboChartBar } from './combo-chart.types';

export interface TxComboBarsInput {
  band: TxBandScale;
  scales: readonly TxContinuousScale[];
  axes: readonly number[];
  stacked: boolean;
  widthRatio: number;
  groupGap: number;
  values: readonly (readonly (number | null)[])[];
  stackedValues: readonly TxStackedValue[][];
  columns: readonly number[];
  colors: readonly (string | undefined)[];
}

function baseOf(scale: TxContinuousScale): number {
  const [d0, d1] = scale.domain;
  return d0 > 0 ? d0 : d1 < 0 ? d1 : 0;
}

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
