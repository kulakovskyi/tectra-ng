export const TX_CHART_PALETTE_SIZE = 7;

export function chartColor(index: number): string {
  const slot = ((index % TX_CHART_PALETTE_SIZE) + TX_CHART_PALETTE_SIZE) % TX_CHART_PALETTE_SIZE;
  return `var(--tx-chart-series-color${slot + 1})`;
}

export function chartPalette(count = TX_CHART_PALETTE_SIZE): string[] {
  return Array.from({ length: count }, (_, index) => chartColor(index));
}

export function seriesColor(color: string | undefined, index: number): string {
  return color || chartColor(index);
}
