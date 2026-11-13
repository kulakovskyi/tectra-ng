/** Number of colours in the series palette. */
export const TX_CHART_PALETTE_SIZE = 7;

/**
 * Palette colour for a series index, as `var(--tx-chart-series-colorN)`; it repeats after the palette
 * size.
 */
export function chartColor(index: number): string {
  const slot = ((index % TX_CHART_PALETTE_SIZE) + TX_CHART_PALETTE_SIZE) % TX_CHART_PALETTE_SIZE;
  return `var(--tx-chart-series-color${slot + 1})`;
}

/** The first `count` palette colours. */
export function chartPalette(count = TX_CHART_PALETTE_SIZE): string[] {
  return Array.from({ length: count }, (_, index) => chartColor(index));
}

/** Own colour of a series, or the palette colour for its index. */
export function seriesColor(color: string | undefined, index: number): string {
  return color || chartColor(index);
}
