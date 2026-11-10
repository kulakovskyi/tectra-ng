import { TxBandScale, TxContinuousScale, TxStackedValue, seriesColor, textWidth } from '@tectra-ng/charts/core';
import { TxColumnChartBar } from './column-chart.types';

export interface TxColumnLayoutInput {
  band: TxBandScale;
  value: TxContinuousScale;
  horizontal: boolean;
  stacked: boolean;
  widthRatio: number;
  groupGap: number;
  values: readonly (readonly (number | null)[])[];
  stackedValues: readonly TxStackedValue[][];
  visible: readonly number[];
  colors: readonly (string | undefined)[];
  labels: ((value: number, series: number, index: number) => string) | null;
  labelFontSize: number;
}

export function columnBars(input: TxColumnLayoutInput): TxColumnChartBar[] {
  const { band, value, horizontal, stacked, visible } = input;
  const group = band.bandwidth * Math.min(1, Math.max(0.05, input.widthRatio));
  const slots = stacked ? 1 : Math.max(1, visible.length);
  const slotSize = (group - input.groupGap * (slots - 1)) / slots;
  const bars: TxColumnChartBar[] = [];
  const outermost = new Map<string, number>();

  if (stacked) {
    for (const seriesIndex of visible) {
      input.stackedValues[seriesIndex]?.forEach((entry, index) => {
        if (!entry || entry[0] === entry[1]) return;
        const sign = entry[1] > entry[0] ? 1 : -1;
        outermost.set(`${index}:${sign}`, seriesIndex);
      });
    }
  }

  visible.forEach((seriesIndex, slot) => {
    const raw = input.values[seriesIndex] ?? [];
    raw.forEach((rawValue, index) => {
      if (rawValue === null || rawValue === undefined) return;
      const base = value.domain[0] > 0 ? value.domain[0] : value.domain[1] < 0 ? value.domain[1] : 0;
      const [from, to] = stacked ? (input.stackedValues[seriesIndex]?.[index] ?? [0, 0]) : [base, rawValue];
      if (from === to) return;
      const start = band.center(index) - group / 2 + (stacked ? 0 : slot * (slotSize + input.groupGap));
      const a = value.map(from);
      const b = value.map(to);
      const positive = to >= from;
      const isEnd = stacked ? outermost.get(`${index}:${positive ? 1 : -1}`) === seriesIndex : true;
      const end = !isEnd || from === to ? null : horizontal ? (positive ? 'right' : 'left') : positive ? 'top' : 'bottom';
      const rect = horizontal
        ? { x: Math.min(a, b), y: start, width: Math.abs(b - a), height: slotSize }
        : { x: start, y: Math.min(a, b), width: slotSize, height: Math.abs(b - a) };
      const text = input.labels ? input.labels(rawValue, seriesIndex, index) : null;
      const textSize = text ? textWidth(text, input.labelFontSize) : 0;
      const inside = !!text && (horizontal ? rect.width >= textSize + 8 && rect.height >= input.labelFontSize + 2 : rect.height >= input.labelFontSize + 6 && rect.width >= textSize + 4);
      const outsideAllowed = !stacked;
      const showLabel = !!text && (inside || outsideAllowed);
      bars.push({
        key: `${seriesIndex}:${index}`,
        series: seriesIndex,
        index,
        ...rect,
        color: seriesColor(input.colors[seriesIndex], seriesIndex),
        end,
        dir: horizontal ? (positive ? 'right' : 'left') : positive ? 'up' : 'down',
        label: showLabel ? text : null,
        labelX: horizontal ? (inside ? rect.x + rect.width / 2 : positive ? rect.x + rect.width + 4 : rect.x - 4) : rect.x + rect.width / 2,
        labelY: horizontal ? rect.y + rect.height / 2 : inside ? rect.y + rect.height / 2 : positive ? rect.y - 4 : rect.y + rect.height + 4,
        inside,
      });
    });
  });
  return bars;
}
