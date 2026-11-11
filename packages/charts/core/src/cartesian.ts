import {
  TxBandScale,
  TxChartAxesModel,
  TxChartAxisLabel,
  TxChartAxisModel,
  TxChartGridLine,
  TxChartLabelMode,
  TxChartPlot,
  TxChartValueFormat,
  TxChartXAxisPosition,
  TxChartYAxisPosition,
  TxContinuousScale,
  TxPointScale,
  TxRange,
  TxTimeScale,
} from './chart.types';
import { textWidth, tickFormatter, timeTickFormatter, truncateText } from './format';
import { bandScale, linearScale, logDomain, logScale, niceDomain, pointScale, timeScale } from './scale';

export type TxCategoryKind = 'band' | 'point' | 'time' | 'linear';

export type TxValueScaleKind = 'linear' | 'log';

export type TxChartGridMode = 'value' | 'category' | 'both' | 'none';

export interface TxCategoryAxisOptions {
  kind: TxCategoryKind;
  labels?: readonly string[];
  count?: number;
  domain?: TxRange;
  format?: (value: number) => string;
  labelMode?: TxChartLabelMode;
  maxLabels?: number;
  maxLabelWidth?: number;
  paddingInner?: number;
  title?: string;
}

export interface TxValueAxisOptions {
  extent: TxRange | null;
  scale?: TxValueScaleKind;
  format?: TxChartValueFormat;
  includeZero?: boolean;
  min?: number;
  max?: number;
  tickCount?: number;
  title?: string;
}

export interface TxCartesianOptions {
  width: number;
  height: number;
  intl: string;
  horizontal?: boolean;
  category: TxCategoryAxisOptions;
  value: TxValueAxisOptions;
  secondaryValue?: TxValueAxisOptions;
  grid?: TxChartGridMode;
  fontSize?: number;
  showCategoryAxis?: boolean;
  showValueAxis?: boolean;
  xAxisPosition?: TxChartXAxisPosition;
  yAxisPosition?: TxChartYAxisPosition;
}

export type TxCategoryScale = TxBandScale | TxPointScale | TxContinuousScale | TxTimeScale;

export interface TxCartesianLayout {
  plot: TxChartPlot;
  value: TxContinuousScale;
  secondaryValue: TxContinuousScale | null;
  category: TxCategoryScale;
  valueTicks: number[];
  secondaryValueTicks: number[];
  axes: TxChartAxesModel;
  horizontal: boolean;
  categoryPosition(index: number, x?: number): number;
  categoryIndexAt(position: number, xs?: readonly number[]): number;
}

const GAP = 8;
const LABEL_PAD = 10;
const ROTATE = -45;

function valueDomain(options: TxValueAxisOptions, count: number): TxRange {
  const [rawMin, rawMax] = options.extent ?? [0, 1];
  if (options.scale === 'log') {
    const positiveMin = rawMin > 0 ? rawMin : 1;
    return logDomain(options.min ?? positiveMin, options.max ?? Math.max(rawMax, positiveMin));
  }
  const includeZero = options.includeZero ?? true;
  const min = options.min ?? (includeZero ? Math.min(0, rawMin) : rawMin);
  const max = options.max ?? (includeZero ? Math.max(0, rawMax) : rawMax);
  const nice = niceDomain(min, max, count);
  return [options.min ?? nice[0], options.max ?? nice[1]];
}

const NICE_STEPS = [1, 2, 2.5, 5, 10];

function niceStepAtLeast(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const base = 10 ** Math.floor(Math.log10(raw));
  const factor = NICE_STEPS.find((step) => step * base >= raw * (1 - 1e-9)) ?? 10;
  return factor * base;
}

export function alignedDomain(options: TxValueAxisOptions, intervals: number, zeroAt: number | null = null): { domain: TxRange; ticks: number[] } | null {
  if (intervals < 1 || options.scale === 'log' || options.min !== undefined || options.max !== undefined) return null;
  const [rawMin, rawMax] = options.extent ?? [0, 1];
  const includeZero = options.includeZero ?? true;
  let min = includeZero ? Math.min(0, rawMin) : rawMin;
  let max = includeZero ? Math.max(0, rawMax) : rawMax;
  if (min === max) {
    min = min > 0 ? 0 : min - 1;
    max = max < 0 ? 0 : max + 1;
  }
  const below = zeroAt !== null && zeroAt > 0 && zeroAt < intervals ? zeroAt : null;
  let step = below !== null ? niceStepAtLeast(Math.max(max / (intervals - below), -min / below)) : niceStepAtLeast((max - min) / intervals);
  for (let round = 0; round < 12; round++) {
    const start = below !== null ? -below * step : Math.floor(min / step + 1e-9) * step;
    const stop = start + intervals * step;
    if (stop >= max - 1e-9 && start <= min + 1e-9) {
      const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9) + 1);
      const ticks = Array.from({ length: intervals + 1 }, (_, index) => Number((start + index * step).toFixed(decimals)) || 0);
      return { domain: [ticks[0], ticks[intervals]], ticks };
    }
    step = niceStepAtLeast(step * 1.0001);
  }
  return null;
}

interface CategoryTick {
  index: number;
  value: number;
  label: string;
}

function pickEvery(ticks: readonly CategoryTick[], every: number): CategoryTick[] {
  if (every <= 1) {
    return [...ticks];
  }
  return ticks.filter((_, position) => position % every === 0);
}

export function cartesianLayout(options: TxCartesianOptions): TxCartesianLayout {
  const fontSize = options.fontSize ?? 12;
  const horizontal = options.horizontal ?? false;
  const width = Math.max(1, options.width);
  const height = Math.max(1, options.height);
  const showCategoryAxis = options.showCategoryAxis ?? true;
  const showValueAxis = options.showValueAxis ?? true;
  const valueLength = horizontal ? width * 0.75 : height - fontSize * 3;
  const tickCount = options.value.tickCount ?? Math.max(2, Math.min(horizontal ? 8 : 6, Math.round(valueLength / (horizontal ? 90 : 62))));
  const domain = valueDomain(options.value, tickCount);
  const probe = options.value.scale === 'log' ? logScale(domain, [0, 1]) : linearScale(domain, [0, 1]);
  const valueTicks = probe.ticks(tickCount);
  const valueFormat = tickFormatter(options.intl, valueTicks, options.value.format);
  const valueLabels = valueTicks.map((tick) => valueFormat(tick));
  const valueLabelWidth = showValueAxis ? Math.max(0, ...valueLabels.map((label) => textWidth(label, fontSize))) : 0;

  const second = horizontal ? undefined : options.secondaryValue;
  const evenTicks =
    valueTicks.length > 1 && valueTicks[0] === domain[0] && valueTicks[valueTicks.length - 1] === domain[1] && options.value.scale !== 'log';
  const primaryZero = evenTicks ? valueTicks.indexOf(0) : -1;
  const aligned = second && evenTicks ? alignedDomain(second, valueTicks.length - 1, primaryZero > 0 ? primaryZero : null) : null;
  const secondDomain: TxRange | null = second ? (aligned?.domain ?? valueDomain(second, tickCount)) : null;
  const secondTicks = second && secondDomain ? (aligned?.ticks ?? (second.scale === 'log' ? logScale(secondDomain, [0, 1]) : linearScale(secondDomain, [0, 1])).ticks(tickCount)) : [];
  const secondFormat = tickFormatter(options.intl, secondTicks, second?.format);
  const secondLabels = secondTicks.map((tick) => secondFormat(tick));
  const secondLabelWidth = second ? Math.max(0, ...secondLabels.map((label) => textWidth(label, fontSize))) : 0;

  const cat = options.category;
  const count = cat.count ?? cat.labels?.length ?? 0;
  const maxLabelWidth = cat.maxLabelWidth ?? 220;
  const lineHeight = fontSize * 1.25;

  const xTop = options.xAxisPosition === 'top';
  const yRight = options.yAxisPosition === 'right';
  const categoryLabelTexts = cat.kind === 'band' || cat.kind === 'point' ? [...(cat.labels ?? [])] : [];
  const titleSpace = lineHeight + 4;

  let ySpace: number;
  let xSpace: number;
  let edgeX: number;
  if (horizontal) {
    const labelWidth = showCategoryAxis ? Math.min(maxLabelWidth, Math.max(0, ...categoryLabelTexts.map((label) => textWidth(label, fontSize)))) : 0;
    ySpace = showCategoryAxis ? labelWidth + LABEL_PAD + 2 : 4;
    xSpace = showValueAxis ? lineHeight + GAP : GAP;
    edgeX = Math.max(12, (showValueAxis ? textWidth(valueLabels[valueLabels.length - 1] ?? '', fontSize) / 2 : 0) + 2);
    if (cat.title && showCategoryAxis) ySpace += titleSpace;
    if (options.value.title && showValueAxis) xSpace += titleSpace;
  } else {
    ySpace = showValueAxis ? valueLabelWidth + LABEL_PAD + 4 : 4;
    xSpace = showCategoryAxis ? lineHeight + GAP : GAP;
    edgeX = 12;
    if (cat.title && showCategoryAxis) xSpace += titleSpace;
    if (options.value.title && showValueAxis) ySpace += titleSpace;
  }
  const edgeY = horizontal ? 4 : fontSize / 2 + 4;
  const secondSpace = second ? secondLabelWidth + LABEL_PAD + 4 + (second.title ? titleSpace : 0) : 0;
  let left = yRight ? (second ? secondSpace : horizontal ? edgeX : 4) : ySpace;
  let right = yRight ? ySpace : second ? secondSpace : edgeX;
  let top = xTop ? xSpace : edgeY;
  let bottom = xTop ? edgeY : xSpace;

  const plotFor = (b: number, l: number, r: number): TxChartPlot => ({
    left: l,
    top,
    width: Math.max(1, width - l - r),
    height: Math.max(1, height - top - b),
  });

  let plot = plotFor(bottom, left, right);
  let rotate = 0;
  let categoryTicks: CategoryTick[] = [];

  const buildScale = (area: TxChartPlot): TxCategoryScale => {
    const range: TxRange = horizontal ? [area.top, area.top + area.height] : [area.left, area.left + area.width];
    if (cat.kind === 'band') return bandScale(count, range, cat.paddingInner ?? 0, 0);
    if (cat.kind === 'point') return pointScale(count, range);
    if (cat.kind === 'time') return timeScale(cat.domain ?? [0, 1], range);
    return linearScale(cat.domain ?? [0, 1], range);
  };

  const ticksFor = (scale: TxCategoryScale, area: TxChartPlot): CategoryTick[] => {
    if (scale.kind === 'band' || scale.kind === 'point') {
      return categoryLabelTexts.map((label, index) => ({ index, value: index, label }));
    }
    const span = horizontal ? area.height : area.width;
    const wanted = Math.max(2, Math.min(12, Math.floor(span / 80)));
    const ticks = scale.kind === 'time' ? (scale as TxTimeScale).ticks(wanted) : scale.ticks(wanted);
    const format =
      cat.format ??
      (scale.kind === 'time'
        ? timeTickFormatter(options.intl, (scale as TxTimeScale).interval(wanted), scale.domain[1] - scale.domain[0])
        : tickFormatter(options.intl, ticks));
    return ticks.map((value, index) => ({ index, value, label: format(value) }));
  };

  const position = (scale: TxCategoryScale, tick: CategoryTick) =>
    scale.kind === 'band' ? scale.center(tick.index) : scale.kind === 'point' ? scale.at(tick.index) : scale.map(tick.value);

  let scale = buildScale(plot);
  if (showCategoryAxis && !horizontal) {
    const all = ticksFor(scale, plot);
    const mode = cat.labelMode ?? 'auto';
    const widest = Math.max(0, ...all.map((tick) => textWidth(tick.label, fontSize)));
    const spacing = all.length > 1 ? Math.abs(position(scale, all[1]) - position(scale, all[0])) : plot.width;
    const limit = cat.maxLabels && all.length > cat.maxLabels ? Math.ceil(all.length / cat.maxLabels) : 1;
    const fitsFlat = widest + GAP <= spacing * limit;
    const rotatedStep = lineHeight * 1.2;
    const canRotate = mode !== 'skip' && (mode === 'rotate' || (all.length <= 40 && spacing * limit >= rotatedStep));
    if (fitsFlat && mode !== 'rotate') {
      categoryTicks = pickEvery(all, limit);
    } else if (canRotate) {
      rotate = ROTATE;
      const capped = Math.min(widest, maxLabelWidth, (height * 0.35) / Math.SQRT1_2);
      const rotatedSpace = (capped + lineHeight) * Math.SQRT1_2 + GAP + (cat.title ? titleSpace : 0);
      if (xTop) {
        top = rotatedSpace;
        right = Math.max(right, capped * Math.SQRT1_2 - 4);
      } else {
        bottom = rotatedSpace;
        left = Math.max(left, capped * Math.SQRT1_2 - 4);
      }
      plot = plotFor(bottom, left, right);
      scale = buildScale(plot);
      const nextSpacing = all.length > 1 ? Math.abs(position(scale, all[1]) - position(scale, all[0])) : plot.width;
      categoryTicks = pickEvery(all, Math.max(limit, Math.ceil(rotatedStep / Math.max(1, nextSpacing))));
    } else {
      categoryTicks = pickEvery(all, Math.max(limit, Math.ceil((widest + GAP) / Math.max(1, spacing))));
    }
    if (!rotate && categoryTicks.length && scale.kind !== 'band') {
      const first = textWidth(categoryTicks[0].label, fontSize) / 2;
      const last = textWidth(categoryTicks[categoryTicks.length - 1].label, fontSize) / 2;
      const firstOverflow = first - (position(scale, categoryTicks[0]) - 0);
      const lastOverflow = position(scale, categoryTicks[categoryTicks.length - 1]) + last - width;
      if (firstOverflow > 0 || lastOverflow > 0) {
        plot = plotFor(bottom, left + Math.max(0, firstOverflow), right + Math.max(0, lastOverflow + 2));
        scale = buildScale(plot);
      }
    }
  } else if (showCategoryAxis) {
    const all = ticksFor(scale, plot);
    const spacing = all.length > 1 ? Math.abs(position(scale, all[1]) - position(scale, all[0])) : plot.height;
    categoryTicks = pickEvery(all, Math.max(1, Math.ceil(lineHeight / Math.max(1, spacing))));
  }

  const valueRange: TxRange = horizontal ? [plot.left, plot.left + plot.width] : [plot.top + plot.height, plot.top];
  const value = options.value.scale === 'log' ? logScale(domain, valueRange) : linearScale(domain, valueRange);
  const secondaryValue = second && secondDomain ? (second.scale === 'log' ? logScale(secondDomain, valueRange) : linearScale(secondDomain, valueRange)) : null;

  const grid: TxChartGridLine[] = [];
  const gridMode = options.grid ?? 'value';
  const axes: TxChartAxisModel[] = [];
  const right2 = plot.left + plot.width;
  const bottom2 = plot.top + plot.height;

  const valueAxisLabels: TxChartAxisLabel[] = valueTicks.map((tick, index) => {
    const at = value.map(tick);
    return horizontal
      ? { text: valueLabels[index], x: at, y: xTop ? plot.top - GAP : bottom2 + GAP, anchor: 'middle', baseline: xTop ? 'auto' : 'hanging', rotate: 0 }
      : { text: valueLabels[index], x: yRight ? right2 + LABEL_PAD : plot.left - LABEL_PAD, y: at, anchor: yRight ? 'start' : 'end', baseline: 'middle', rotate: 0 };
  });
  if (gridMode === 'value' || gridMode === 'both') {
    valueTicks.forEach((tick) => {
      const at = value.map(tick);
      grid.push(horizontal ? { x1: at, y1: plot.top, x2: at, y2: bottom2 } : { x1: plot.left, y1: at, x2: right2, y2: at });
    });
  }
  if (gridMode === 'category' || gridMode === 'both') {
    categoryTicks.forEach((tick) => {
      const at = position(scale, tick);
      grid.push(horizontal ? { x1: plot.left, y1: at, x2: right2, y2: at } : { x1: at, y1: plot.top, x2: at, y2: bottom2 });
    });
  }

  const xTitle = (text: string) => ({ text, x: plot.left + plot.width / 2, y: xTop ? lineHeight - 2 : height - 4, rotate: 0 });
  const yTitle = (text: string, onRight = yRight) => ({ text, x: onRight ? width - lineHeight / 2 - 2 : lineHeight / 2 + 2, y: plot.top + plot.height / 2, rotate: onRight ? 90 : -90 });

  if (showValueAxis) {
    axes.push({
      position: horizontal ? (xTop ? 'top' : 'bottom') : yRight ? 'right' : 'left',
      labels: valueAxisLabels,
      line: null,
      title: options.value.title ? (horizontal ? xTitle(options.value.title) : yTitle(options.value.title)) : undefined,
    });
  }

  if (second && secondaryValue) {
    const onRight = !yRight;
    axes.push({
      position: onRight ? 'right' : 'left',
      labels: secondTicks.map((tick, index) => ({
        text: secondLabels[index],
        x: onRight ? right2 + LABEL_PAD : plot.left - LABEL_PAD,
        y: secondaryValue.map(tick),
        anchor: onRight ? 'start' : 'end',
        baseline: 'middle',
        rotate: 0,
      })),
      line: null,
      title: second.title ? yTitle(second.title, onRight) : undefined,
    });
  }

  if (showCategoryAxis) {
    const labels: TxChartAxisLabel[] = categoryTicks.map((tick) => {
      const at = position(scale, tick);
      if (horizontal) {
        const text = truncateText(tick.label, maxLabelWidth, fontSize);
        return {
          text,
          x: yRight ? right2 + LABEL_PAD : plot.left - LABEL_PAD,
          y: at,
          anchor: yRight ? 'start' : 'end',
          baseline: 'middle',
          rotate: 0,
          title: text !== tick.label ? tick.label : undefined,
        };
      }
      const y = xTop ? plot.top - GAP : bottom2 + GAP;
      const baseline = xTop ? 'auto' : 'hanging';
      if (rotate) {
        const text = truncateText(tick.label, Math.min(maxLabelWidth, (height * 0.35) / Math.SQRT1_2), fontSize);
        return { text, x: at, y, anchor: xTop ? 'start' : 'end', baseline, rotate, title: text !== tick.label ? tick.label : undefined };
      }
      return { text: tick.label, x: at, y, anchor: 'middle', baseline, rotate: 0 };
    });
    axes.push({
      position: horizontal ? (yRight ? 'right' : 'left') : xTop ? 'top' : 'bottom',
      labels,
      line: null,
      title: cat.title ? (horizontal ? yTitle(cat.title) : xTitle(cat.title)) : undefined,
    });
  }

  const zeroAt = domain[0] < 0 && domain[1] > 0 && options.value.scale !== 'log' ? value.map(0) : null;
  const zero: TxChartGridLine | null =
    zeroAt === null ? null : horizontal ? { x1: zeroAt, y1: plot.top, x2: zeroAt, y2: bottom2, zero: true } : { x1: plot.left, y1: zeroAt, x2: right2, y2: zeroAt, zero: true };

  const categoryPosition = (index: number, x?: number) => {
    if (scale.kind === 'band') return scale.center(index);
    if (scale.kind === 'point') return scale.at(index);
    return scale.map(x ?? index);
  };

  const categoryIndexAt = (at: number, xs?: readonly number[]) => {
    if (scale.kind === 'band' || scale.kind === 'point') return scale.indexAt(at);
    const target = scale.invert(at);
    const values = xs ?? [];
    let best = -1;
    let distance = Infinity;
    values.forEach((x, index) => {
      const next = Math.abs(x - target);
      if (next < distance) {
        distance = next;
        best = index;
      }
    });
    return best;
  };

  return { plot, value, secondaryValue, category: scale, valueTicks, secondaryValueTicks: secondTicks, axes: { axes, grid, zero }, horizontal, categoryPosition, categoryIndexAt };
}
