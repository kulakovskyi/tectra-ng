import { seriesColor } from '@tectra-ng/charts/core';
import { TxSankeyAlign, TxSankeyLayout, TxSankeyLayoutLink, TxSankeyLayoutNode, TxSankeyLink, TxSankeyNode } from './sankey-chart.types';

/** Size and spacing settings of `sankeyLayout`. */
export interface TxSankeyOptions {
  /** Width of the area, in px. */
  width: number;
  /** Height of the area, in px. */
  height: number;
  /** Width of a node, in px. */
  nodeWidth: number;
  /** Vertical gap between nodes of a column, in px. */
  nodePadding: number;
  /** Where nodes without outgoing links go (default `justify`). */
  align?: TxSankeyAlign;
  /** Number of passes that move nodes towards their linked nodes (default 24). */
  iterations?: number;
  /** Offset added to every vertical position, in px (default 0). */
  top?: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** SVG path of a smooth centre line between two points, for a flow of no width. */
export function sankeyLinkPath(x0: number, y0: number, x1: number, y1: number): string {
  const middle = (x0 + x1) / 2;
  return `M${round(x0)},${round(y0)}C${round(middle)},${round(y0)} ${round(middle)},${round(y1)} ${round(x1)},${round(y1)}`;
}

/** SVG path of a flow ribbon of the given width between two points. */
export function sankeyRibbonPath(x0: number, y0: number, x1: number, y1: number, width: number): string {
  const middle = (x0 + x1) / 2;
  const half = width / 2;
  return (
    `M${round(x0)},${round(y0 - half)}C${round(middle)},${round(y0 - half)} ${round(middle)},${round(y1 - half)} ${round(x1)},${round(y1 - half)}` +
    `L${round(x1)},${round(y1 + half)}C${round(middle)},${round(y1 + half)} ${round(middle)},${round(y0 + half)} ${round(x0)},${round(y0 + half)}Z`
  );
}

/** Vertical position of the link centre line at a horizontal position `x`. */
export function sankeyLinkY(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x <= x0) return y0;
  if (x >= x1) return y1;
  let low = 0;
  let high = 1;
  for (let step = 0; step < 24; step++) {
    const t = (low + high) / 2;
    const at = (1 - t) ** 3 * x0 + 3 * (1 - t) ** 2 * t * ((x0 + x1) / 2) + 3 * (1 - t) * t ** 2 * ((x0 + x1) / 2) + t ** 3 * x1;
    if (at < x) low = t;
    else high = t;
  }
  const t = (low + high) / 2;
  return (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y0 + 3 * (1 - t) * t ** 2 * y1 + t ** 3 * y1;
}

/** Positions nodes in columns and sizes the links; cycles are broken and invalid links dropped. */
export function sankeyLayout(nodesInput: readonly TxSankeyNode[], linksInput: readonly TxSankeyLink[], options: TxSankeyOptions): TxSankeyLayout {
  const ids: string[] = [];
  const add = (id: string) => {
    if (!ids.includes(id)) ids.push(id);
  };
  nodesInput.forEach((node) => add(node.id));
  const valid = linksInput.filter((link) => link.source !== link.target && Number.isFinite(link.value) && link.value > 0);
  valid.forEach((link) => {
    add(link.source);
    add(link.target);
  });
  const meta = new Map(nodesInput.map((node) => [node.id, node]));
  const outgoing = ids.map(() => [] as number[]);
  const incoming = ids.map(() => [] as number[]);
  const linkPairs = valid.map((link) => ({ link, source: ids.indexOf(link.source), target: ids.indexOf(link.target) }));

  const depth = ids.map(() => 0);
  const order: number[] = [];
  const state = ids.map(() => 0);
  const kept: typeof linkPairs = [];
  const visit = (node: number) => {
    state[node] = 1;
    for (const pair of linkPairs) {
      if (pair.source !== node) continue;
      if (state[pair.target] === 1) continue;
      kept.push(pair);
      if (state[pair.target] === 0) visit(pair.target);
    }
    state[node] = 2;
    order.unshift(node);
  };
  ids.forEach((_, node) => {
    if (state[node] === 0 && !linkPairs.some((pair) => pair.target === node)) visit(node);
  });
  ids.forEach((_, node) => {
    if (state[node] === 0) visit(node);
  });
  const links = linkPairs.filter((pair) => kept.includes(pair));
  links.forEach((pair, index) => {
    outgoing[pair.source].push(index);
    incoming[pair.target].push(index);
  });
  for (const node of order) {
    for (const index of outgoing[node]) {
      const target = links[index].target;
      depth[target] = Math.max(depth[target], depth[node] + 1);
    }
  }
  const columns = Math.max(1, ...depth.map((value) => value + 1));
  if ((options.align ?? 'justify') === 'justify') {
    ids.forEach((_, node) => {
      if (!outgoing[node].length && incoming[node].length) depth[node] = columns - 1;
    });
  }

  const sum = (list: number[]) => list.reduce((total, index) => total + links[index].link.value, 0);
  const values = ids.map((_, node) => Math.max(sum(incoming[node]), sum(outgoing[node])));
  const byColumn = Array.from({ length: columns }, (_, column) => ids.map((_, node) => node).filter((node) => depth[node] === column));
  const padding = options.nodePadding;
  const ky = Math.min(
    ...byColumn.filter((column) => column.length).map((column) => (options.height - (column.length - 1) * padding) / Math.max(1e-9, column.reduce((total, node) => total + values[node], 0))),
  );
  const step = columns > 1 ? (options.width - options.nodeWidth) / (columns - 1) : 0;
  const height = values.map((value) => Math.max(1, value * ky));
  const y = ids.map(() => 0);
  byColumn.forEach((column, at) => {
    if (at) {
      const weight = (node: number) => {
        const total = incoming[node].reduce((acc, index) => acc + links[index].link.value, 0);
        return total ? incoming[node].reduce((acc, index) => acc + (y[links[index].source] + height[links[index].source] / 2) * links[index].link.value, 0) / total : Infinity;
      };
      const order = new Map(column.map((node) => [node, weight(node)]));
      column.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
    }
    let cursor = 0;
    column.forEach((node) => {
      y[node] = cursor;
      cursor += height[node] + padding;
    });
  });

  const center = (node: number) => y[node] + height[node] / 2;
  const resolve = (column: number[]) => {
    column.sort((a, b) => y[a] - y[b]);
    let cursor = 0;
    for (const node of column) {
      y[node] = Math.max(y[node], cursor);
      cursor = y[node] + height[node] + padding;
    }
    let limit = options.height;
    for (let at = column.length - 1; at >= 0; at--) {
      const node = column[at];
      y[node] = Math.min(y[node], limit - height[node]);
      limit = y[node] - padding;
    }
    cursor = 0;
    for (const node of column) {
      y[node] = Math.max(y[node], cursor);
      cursor = y[node] + height[node] + padding;
    }
  };
  const iterations = options.iterations ?? 24;
  for (let pass = 0; pass < iterations; pass++) {
    const weight = 0.99 ** pass;
    const forward = pass % 2 === 0;
    const columnsOrder = forward ? byColumn.slice(1) : byColumn.slice(0, -1).reverse();
    for (const column of columnsOrder) {
      for (const node of column) {
        const related = forward ? incoming[node].map((index) => links[index].source) : outgoing[node].map((index) => links[index].target);
        const linked = forward ? incoming[node] : outgoing[node];
        if (!related.length) continue;
        const total = linked.reduce((acc, index) => acc + links[index].link.value, 0);
        const target = linked.reduce((acc, index, at) => acc + center(related[at]) * links[index].link.value, 0) / Math.max(1e-9, total);
        y[node] += (target - center(node)) * weight;
      }
      resolve(column);
    }
  }

  const top = options.top ?? 0;
  const layoutNodes: TxSankeyLayoutNode[] = ids.map((id, node) => ({
    id,
    index: node,
    label: meta.get(id)?.label ?? id,
    color: seriesColor(meta.get(id)?.color, node),
    depth: depth[node],
    value: values[node],
    incoming: sum(incoming[node]),
    outgoing: sum(outgoing[node]),
    x: round(depth[node] * step),
    y: round(y[node] + top),
    width: options.nodeWidth,
    height: round(height[node]),
  }));

  const sourceOffset = ids.map(() => 0);
  const targetOffset = ids.map(() => 0);
  const sorted = links.map((_, index) => index);
  const byTarget = [...sorted].sort((a, b) => center(links[a].target) - center(links[b].target));
  const bySource = [...sorted].sort((a, b) => center(links[a].source) - center(links[b].source));
  const y0 = links.map(() => 0);
  const y1 = links.map(() => 0);
  for (const index of byTarget) {
    const pair = links[index];
    const width = pair.link.value * ky;
    y0[index] = y[pair.source] + top + sourceOffset[pair.source] + width / 2;
    sourceOffset[pair.source] += width;
  }
  for (const index of bySource) {
    const pair = links[index];
    const width = pair.link.value * ky;
    y1[index] = y[pair.target] + top + targetOffset[pair.target] + width / 2;
    targetOffset[pair.target] += width;
  }
  const layoutLinks: TxSankeyLayoutLink[] = links.map((pair, index) => {
    const source = layoutNodes[pair.source];
    const target = layoutNodes[pair.target];
    return {
      index,
      key: `${source.id}>${target.id}`,
      source,
      target,
      value: pair.link.value,
      width: round(Math.max(1, pair.link.value * ky)),
      y0: round(y0[index]),
      y1: round(y1[index]),
      path: sankeyRibbonPath(source.x + source.width, y0[index], target.x, y1[index], Math.max(1, pair.link.value * ky)),
      color: pair.link.color ?? source.color,
    };
  });
  return { nodes: layoutNodes, links: layoutLinks, columns };
}
