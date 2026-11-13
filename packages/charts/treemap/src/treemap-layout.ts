import { TxTreemapItem, TxTreemapNode, TxTreemapRect } from './treemap.types';

function worst(row: readonly number[], side: number): number {
  const sum = row.reduce((total, value) => total + value, 0);
  if (!sum || !side) return Infinity;
  const max = Math.max(...row);
  const min = Math.min(...row);
  const side2 = side * side;
  const sum2 = sum * sum;
  return Math.max((side2 * max) / sum2, sum2 / (side2 * min));
}

/**
 * Squarified treemap layout: fills a rectangle with one node per positive value, largest first, with tiles as square as possible.
 */
export function squarify<T>(items: readonly { value: number; item: T }[], rect: TxTreemapRect): TxTreemapNode<T>[] {
  const indexed = items
    .map((entry, index) => ({ ...entry, index }))
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = indexed.reduce((sum, entry) => sum + entry.value, 0);
  const nodes: TxTreemapNode<T>[] = [];
  if (!total || rect.width <= 0 || rect.height <= 0) return nodes;
  const scale = (rect.width * rect.height) / total;
  const areas = indexed.map((entry) => entry.value * scale);
  let { x, y, width, height } = rect;
  let start = 0;
  while (start < areas.length) {
    const side = Math.min(width, height);
    let end = start + 1;
    while (end < areas.length && worst(areas.slice(start, end + 1), side) <= worst(areas.slice(start, end), side)) {
      end += 1;
    }
    const row = areas.slice(start, end);
    const sum = row.reduce((total, area) => total + area, 0);
    const horizontal = width >= height;
    const thickness = horizontal ? sum / height : sum / width;
    let offset = 0;
    row.forEach((area, position) => {
      const entry = indexed[start + position];
      const length = area / thickness;
      nodes.push({
        index: entry.index,
        value: entry.value,
        item: entry.item,
        x: horizontal ? x : x + offset,
        y: horizontal ? y + offset : y,
        width: horizontal ? thickness : length,
        height: horizontal ? length : thickness,
      });
      offset += length;
    });
    if (horizontal) {
      x += thickness;
      width -= thickness;
    } else {
      y += thickness;
      height -= thickness;
    }
    start = end;
  }
  return nodes;
}

/** Value of an item: the sum of its children for a group, otherwise its own value; never below zero. */
export function treemapValue(item: TxTreemapItem): number {
  if (item.children?.length) {
    return item.children.reduce((sum, child) => sum + Math.max(0, treemapValue(child)), 0);
  }
  return Number.isFinite(item.value) ? Math.max(0, item.value ?? 0) : 0;
}

/** Shrinks a rectangle by `inset` px in total on each axis, keeping it centred. */
export function insetRect(rect: TxTreemapRect, inset: number): TxTreemapRect {
  const half = inset / 2;
  return {
    x: rect.x + half,
    y: rect.y + half,
    width: Math.max(0, rect.width - inset),
    height: Math.max(0, rect.height - inset),
  };
}
