import { TxSplitterLayoutState, TxSplitterPanelLimits } from './splitter.types';

export function moveGutter(
  state: TxSplitterLayoutState,
  limits: readonly TxSplitterPanelLimits[],
  gutter: number,
  delta: number,
): TxSplitterLayoutState {
  const next = { sizes: [...state.sizes], collapsed: [...state.collapsed] };
  if (delta > 0) {
    grow(next, limits, gutter, delta, 1);
  } else if (delta < 0) {
    grow(next, limits, gutter + 1, -delta, -1);
  }
  return next;
}

function grow(state: TxSplitterLayoutState, limits: readonly TxSplitterPanelLimits[], index: number, requested: number, direction: 1 | -1): void {
  const { sizes, collapsed } = state;
  const own = limits[index];
  const room = Math.max(0, own.maxSize - sizes[index]);
  let wanted = Math.min(requested, room);
  if (own.collapsible && collapsed[index]) {
    wanted = Math.min(Math.max(wanted, own.minSize - own.collapsedSize), room);
  }
  let taken = 0;
  for (let i = index + direction; i >= 0 && i < sizes.length && taken < wanted; i += direction) {
    const other = limits[i];
    if (collapsed[i]) {
      continue;
    }
    const floor = other.collapsible ? other.collapsedSize : other.minSize;
    const amount = Math.min(wanted - taken, Math.max(0, sizes[i] - floor));
    const raw = sizes[i] - amount;
    const snaps = other.collapsible && raw < other.minSize;
    const size = snaps ? other.collapsedSize : Math.max(raw, other.minSize);
    taken += sizes[i] - size;
    sizes[i] = size;
    collapsed[i] = snaps;
  }
  sizes[index] += taken;
  if (own.collapsible && collapsed[index] && sizes[index] >= own.minSize) {
    collapsed[index] = false;
  }
}
