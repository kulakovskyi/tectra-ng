/** The category and series a chart currently highlights. */
export interface TxChartActive {
  /** Index of the category. */
  index: number;
  /** Index of the series. */
  series: number;
  /** Pointer y inside the plot, in px; `null` for the keyboard. */
  pointerY: number | null;
  /** `true` when the keyboard, not the pointer, set it. */
  keyboard: boolean;
}

/** Copy of a set with the key added, or removed if it was there; used to hide and show series. */
export function toggleKey(keys: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(keys);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

/** Next index for an arrow, `Home` or `End` key; `-1` when there is nothing to step through. */
export function stepIndex(key: string, index: number, count: number, forward = 'ArrowRight', back = 'ArrowLeft'): number {
  if (count <= 0) {
    return -1;
  }
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (index < 0) return key === back ? count - 1 : 0;
  if (key === forward) return Math.min(count - 1, index + 1);
  if (key === back) return Math.max(0, index - 1);
  return index;
}

/** Moves `step` places through the allowed indexes and wraps around; `-1` when none are allowed. */
export function cycleIndex(index: number, step: number, allowed: readonly number[]): number {
  if (!allowed.length) {
    return -1;
  }
  const at = allowed.indexOf(index);
  if (at < 0) {
    return allowed[0];
  }
  return allowed[(at + step + allowed.length) % allowed.length];
}
