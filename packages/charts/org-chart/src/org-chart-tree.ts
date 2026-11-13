import { TxOrgChartChildrenView, TxOrgChartExpandState, TxOrgChartNode, TxOrgChartRect } from './org-chart.types';

/** Distance in px between a card and the horizontal line of its connectors. */
export const TX_ORG_CHART_CONNECTOR_GAP = 24;

/**
 * Decides what is drawn under a node: nothing for a closed one, a skeleton while loading, its children, or the empty text.
 */
export function orgChartChildren(node: TxOrgChartNode): TxOrgChartChildrenView {
  const nodes = node.children ?? [];
  const emptyText = node.childrenEmptyText ?? '';
  if (node.collapsible && !node.expanded) return { kind: 'none', nodes: [], emptyText };
  if (node.loading) return { kind: 'loading', nodes: [], emptyText };
  if (nodes.length) return { kind: 'nodes', nodes, emptyText };
  return { kind: emptyText ? 'empty' : 'none', nodes: [], emptyText };
}

function collapsibleNodes(nodes: readonly TxOrgChartNode[]): TxOrgChartNode[] {
  return nodes.flatMap((node) => [...(node.collapsible ? [node] : []), ...collapsibleNodes(node.children ?? [])]);
}

/** Tells whether all, none or some collapsible nodes of the tree are open. */
export function orgChartExpandState(nodes: readonly TxOrgChartNode[]): TxOrgChartExpandState {
  const collapsible = collapsibleNodes(nodes);
  const expanded = collapsible.filter((node) => node.expanded).length;
  return {
    hasCollapsible: collapsible.length > 0,
    allExpanded: collapsible.length > 0 && expanded === collapsible.length,
    noneExpanded: expanded === 0,
  };
}

/**
 * SVG path of the connectors along a chain of rectangles, each parent to the next child; `radius` rounds the corners.
 */
export function orgChartPathLine(rects: readonly TxOrgChartRect[], gap = TX_ORG_CHART_CONNECTOR_GAP, radius = 0, offset = 0, inset = 0): string {
  const round = (value: number) => Math.round(value * 100) / 100;
  return rects
    .slice(1)
    .map((child, index) => {
      const parent = rects[index];
      const fromX = round(parent.x + parent.width / 2 + offset);
      const toX = round(child.x + child.width / 2 + offset);
      const fromY = round(parent.y + parent.height + inset);
      const toY = round(child.y - inset);
      const turnY = round(child.y - gap + offset);
      const dx = toX - fromX;
      const r = Math.max(0, Math.min(radius, Math.abs(dx) / 2, (turnY - fromY) / 2, (toY - turnY) / 2));
      if (!dx || !r) {
        return `M ${fromX} ${fromY} V ${turnY} H ${toX} V ${toY}`;
      }
      const sign = Math.sign(dx);
      const sweep = sign > 0 ? 0 : 1;
      return [
        `M ${fromX} ${fromY}`,
        `V ${round(turnY - r)}`,
        `A ${r} ${r} 0 0 ${sweep} ${round(fromX + sign * r)} ${turnY}`,
        `H ${round(toX - sign * r)}`,
        `A ${r} ${r} 0 0 ${1 - sweep} ${toX} ${round(turnY + r)}`,
        `V ${toY}`,
      ].join(' ');
    })
    .join(' ');
}

/**
 * Returns the tree with the node `id` opened or closed; `expanded` sets it, otherwise it flips. The input is not changed.
 */
export function orgChartToggle(nodes: readonly TxOrgChartNode[], id: string, expanded?: boolean): TxOrgChartNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, expanded: expanded ?? !node.expanded };
    return node.children?.length ? { ...node, children: orgChartToggle(node.children, id, expanded) } : node;
  });
}

/** Returns the tree with every collapsible node open or closed. The input is not changed. */
export function orgChartExpandAll(nodes: readonly TxOrgChartNode[], expanded: boolean): TxOrgChartNode[] {
  return nodes.map((node) => ({
    ...node,
    ...(node.collapsible ? { expanded } : {}),
    ...(node.children?.length ? { children: orgChartExpandAll(node.children, expanded) } : {}),
  }));
}

/** Ids of the nodes whose title or subtitle contains the text, ignoring case; empty for an empty query. */
export function orgChartSearch(nodes: readonly TxOrgChartNode[], query: string): string[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return nodes.flatMap((node) => [
    ...([node.title, node.subtitle ?? ''].some((text) => text.toLocaleLowerCase().includes(needle)) ? [node.id] : []),
    ...orgChartSearch(node.children ?? [], query),
  ]);
}

/** Ids from a root down to the node `id`, both included; empty when the node is not in the tree. */
export function orgChartPathTo(nodes: readonly TxOrgChartNode[], id: string): string[] {
  for (const node of nodes) {
    if (node.id === id) return [node.id];
    const inner = orgChartPathTo(node.children ?? [], id);
    if (inner.length) return [node.id, ...inner];
  }
  return [];
}

/** Returns the tree with the collapsible ancestors of the given nodes open. The input is not changed. */
export function orgChartReveal(nodes: readonly TxOrgChartNode[], ids: Iterable<string>): TxOrgChartNode[] {
  const open = new Set<string>();
  for (const id of ids) {
    orgChartPathTo(nodes, id)
      .slice(0, -1)
      .forEach((ancestor) => open.add(ancestor));
  }
  const walk = (list: readonly TxOrgChartNode[]): TxOrgChartNode[] =>
    list.map((node) => ({
      ...node,
      ...(open.has(node.id) && node.collapsible ? { expanded: true } : {}),
      ...(node.children?.length ? { children: walk(node.children) } : {}),
    }));
  return open.size ? walk(nodes) : [...nodes];
}
