import { TxChartHeight, TxChartLegendPosition, TxChartSize } from './chart.types';

/** Width used for the first render before the chart is measured, in px. */
export const TX_CHART_FALLBACK_WIDTH = 640;
/** Height used when a chart height is not a usable pixel value, in px. */
export const TX_CHART_FALLBACK_HEIGHT = 350;
/** Height of a legend or toolbar row above or below the plot, in px. */
export const TX_CHART_LEGEND_ROW = 31;
/** Width taken by a legend on the left or right side, in px. */
export const TX_CHART_LEGEND_SIDE = 175;

/** Chart height in px from a number or a `px` string; the fallback for anything else. */
export function chartHeightValue(height: TxChartHeight, fallback = TX_CHART_FALLBACK_HEIGHT): number {
  if (typeof height === 'number') {
    return Number.isFinite(height) && height > 0 ? height : fallback;
  }
  const pixels = /^(\d+(?:\.\d+)?)px$/.exec(height.trim());
  return pixels ? Number(pixels[1]) : fallback;
}

/** Height of the plot box: the chart height without the legend and toolbar rows. */
export function chartBoxHeight(height: TxChartHeight, legend: TxChartLegendPosition | null, toolbar = false): number {
  const total = chartHeightValue(height);
  const rows = (legend === 'top' || legend === 'bottom' ? 1 : 0) + (toolbar && legend !== 'top' ? 1 : 0);
  return Math.max(1, total - rows * TX_CHART_LEGEND_ROW);
}

/** Size of the plot box for the first render, before the chart is measured. */
export function initialChartSize(height: TxChartHeight, legend: TxChartLegendPosition | null, width = TX_CHART_FALLBACK_WIDTH, toolbar = false): TxChartSize {
  return {
    width: legend === 'left' || legend === 'right' ? width - TX_CHART_LEGEND_SIDE : width,
    height: chartBoxHeight(height, legend, toolbar),
  };
}
