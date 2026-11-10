import { TxChartHeight, TxChartLegendPosition, TxChartSize } from './chart.types';

export const TX_CHART_FALLBACK_WIDTH = 640;
export const TX_CHART_FALLBACK_HEIGHT = 350;
export const TX_CHART_LEGEND_ROW = 31;
export const TX_CHART_LEGEND_SIDE = 175;

export function chartHeightValue(height: TxChartHeight, fallback = TX_CHART_FALLBACK_HEIGHT): number {
  if (typeof height === 'number') {
    return Number.isFinite(height) && height > 0 ? height : fallback;
  }
  const pixels = /^(\d+(?:\.\d+)?)px$/.exec(height.trim());
  return pixels ? Number(pixels[1]) : fallback;
}

export function chartBoxHeight(height: TxChartHeight, legend: TxChartLegendPosition | null): number {
  const total = chartHeightValue(height);
  return legend === 'top' || legend === 'bottom' ? Math.max(1, total - TX_CHART_LEGEND_ROW) : total;
}

export function initialChartSize(height: TxChartHeight, legend: TxChartLegendPosition | null, width = TX_CHART_FALLBACK_WIDTH): TxChartSize {
  return {
    width: legend === 'left' || legend === 'right' ? width - TX_CHART_LEGEND_SIDE : width,
    height: chartBoxHeight(height, legend),
  };
}
