/** Position of a value on the scale from 0 to 1, clamped; 0 for a missing value or an empty scale. */
export function gaugeRatio(value: number | null, min: number, max: number): number {
  if (value === null || !Number.isFinite(value) || !(max > min)) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/** Angle of a value between `start` and `end`, in the same unit as they are. */
export function gaugeAngle(value: number | null, min: number, max: number, start: number, end: number): number {
  return start + (end - start) * gaugeRatio(value, min, max);
}

/**
 * SVG path of the needle, a narrow shape from the center at (`cx`, `cy`) up to `length`, `width` wide at its base.
 */
export function gaugeNeedle(cx: number, cy: number, length: number, width: number): string {
  const half = width / 2;
  const round = (value: number) => Math.round(value * 100) / 100;
  return `M${round(cx - half)},${round(cy)}L${round(cx - 1)},${round(cy - length)}L${round(cx + 1)},${round(cy - length)}L${round(cx + half)},${round(cy)}Z`;
}
