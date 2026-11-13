import { TxListNavigationOptions } from './list-navigation.types';

function step(from: number, delta: number, { count, loop = true, isDisabled }: TxListNavigationOptions): number {
  let index = from;
  for (let tries = 0; tries < count; tries += 1) {
    index += delta;
    if (index < 0 || index >= count) {
      if (!loop) {
        return from;
      }
      index = (index + count) % count;
    }
    if (!isDisabled?.(index)) {
      return index;
    }
  }
  return from;
}

function edge(start: number, delta: number, options: TxListNavigationOptions): number {
  return options.isDisabled?.(start) ? step(start, delta, { ...options, loop: false }) : start;
}

/**
 * Index a list moves to for a navigation key (arrows, `Home`, `End`, `PageUp`, `PageDown`), skipping disabled
 * items; `null` for any other key or an empty list.
 */
export function nextListIndex(key: string, options: TxListNavigationOptions): number | null {
  const { count, current, pageSize = 10 } = options;
  if (!count) {
    return null;
  }
  switch (key) {
    case 'ArrowDown':
      return current < 0 ? edge(0, 1, options) : step(current, 1, options);
    case 'ArrowUp':
      return current < 0 ? edge(count - 1, -1, options) : step(current, -1, options);
    case 'Home':
      return edge(0, 1, options);
    case 'End':
      return edge(count - 1, -1, options);
    case 'PageDown':
      return Math.min(count - 1, Math.max(current, 0) + pageSize);
    case 'PageUp':
      return Math.max(0, current - pageSize);
    default:
      return null;
  }
}
