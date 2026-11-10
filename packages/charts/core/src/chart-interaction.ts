export interface TxChartActive {
  index: number;
  series: number;
  pointerY: number | null;
  keyboard: boolean;
}

export function toggleKey(keys: ReadonlySet<string>, key: string): Set<string> {
  const next = new Set(keys);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

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
