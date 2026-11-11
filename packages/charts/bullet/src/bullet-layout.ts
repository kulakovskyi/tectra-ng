export interface TxBulletSegment {
  level: number;
  from: number;
  to: number;
}

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

export function bulletMax(values: readonly (number | null | undefined)[]): number {
  return Math.max(0, ...values.filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value)));
}
