
const round = (value: number) => Math.round(value * 100) / 100;

export function radialRings(count: number, outer: number, inner: number, thickness: number): { radius: number; width: number }[] {
  if (!count) return [];
  const slot = Math.max(1, (outer - inner) / count);
  const width = Math.max(1, slot * Math.min(1, Math.max(0.05, thickness)));
  return Array.from({ length: count }, (_, index) => ({ radius: round(outer - slot * index - width / 2), width: round(width) }));
}

export function radialShare(value: number | null, max: number): number {
  if (value === null || !Number.isFinite(value) || !(max > 0)) return 0;
  return Math.max(0, Math.min(1, value / max));
}

