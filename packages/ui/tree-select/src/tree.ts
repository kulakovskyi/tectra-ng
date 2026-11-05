import { TxTreeNode } from './tree-select.types';

export function walkTree(nodes: readonly TxTreeNode[], visit: (node: TxTreeNode, parent: TxTreeNode | null) => void, parent: TxTreeNode | null = null): void {
  for (const node of nodes) {
    visit(node, parent);
    walkTree(node.children ?? [], visit, node);
  }
}

export function findNode(nodes: readonly TxTreeNode[], key: string): TxTreeNode | null {
  let found: TxTreeNode | null = null;
  walkTree(nodes, (node) => {
    if (!found && node.key === key) {
      found = node;
    }
  });
  return found;
}

export function descendantKeys(node: TxTreeNode): string[] {
  const keys: string[] = [];
  walkTree(node.children ?? [], (child) => {
    if (!child.disabled) {
      keys.push(child.key);
    }
  });
  return keys;
}

export function parentMap(nodes: readonly TxTreeNode[]): Map<string, TxTreeNode | null> {
  const parents = new Map<string, TxTreeNode | null>();
  walkTree(nodes, (node, parent) => parents.set(node.key, parent));
  return parents;
}

export function normalizeChecked(nodes: readonly TxTreeNode[], keys: readonly string[]): string[] {
  const checked = new Set(keys);
  const settle = (node: TxTreeNode): boolean => {
    const children = (node.children ?? []).filter((child) => !child.disabled);
    if (!children.length) {
      return checked.has(node.key);
    }
    const all = children.map(settle).every(Boolean);
    if (all) {
      checked.add(node.key);
    } else {
      checked.delete(node.key);
    }
    return all;
  };
  nodes.forEach(settle);
  const order: string[] = [];
  walkTree(nodes, (node) => checked.has(node.key) && order.push(node.key));
  return order;
}
