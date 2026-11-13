/** A range between two values on the scale, with its shade level. */
export interface TxBulletSegment {
  /** Shade level; 1 is the darkest. */
  level: number;
  /** Start of the range. */
  from: number;
  /** End of the range. */
  to: number;
}

/**
 * Splits the scale from `min` to `max` at the thresholds in `ranges` and gives each part a shade level out of `levels`.
 */
export function bulletSegments(ranges: readonly number[], min: number, max: number, levels: number): TxBulletSegment[] {
  const thresholds = [...ranges].filter((value) => Number.isFinite(value) && value > min).sort((a, b) => a - b);
  const stops = [...thresholds.map((value) => Math.min(value, max)), max].filter((value, index, list) => index === 0 || value > list[index - 1]);
  let from = min;
  return stops.map((to, index) => {
    const segment = { level: Math.min(levels, index + 1 + Math.max(0, levels - stops.length)), from, to };
    from = to;
    return segment;
  });
}

/** Biggest finite number of the list, at least 0; used as the default end of the scale. */
export function bulletMax(values: readonly (number | null | undefined)[]): number {
  return Math.max(0, ...values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value)));
}
