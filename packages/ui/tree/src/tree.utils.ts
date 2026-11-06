import { foldText, readOptionField } from '@tectra-ng/ui/select';
import { TxTreeDropPosition, TxTreeFilterMode, TxTreeNode, TxTreeScope } from './tree.types';

export function walkTree<T = unknown>(
  nodes: readonly TxTreeNode<T>[],
  visit: (node: TxTreeNode<T>, parent: TxTreeNode<T> | null) => void,
  parent: TxTreeNode<T> | null = null,
): void {
  for (const node of nodes) {
    visit(node, parent);
    walkTree(node.children ?? [], visit, node);
  }
}

export function findNode<T = unknown>(nodes: readonly TxTreeNode<T>[], key: string): TxTreeNode<T> | null {
  let found: TxTreeNode<T> | null = null;
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
    if (!child.disabled && child.selectable !== false) {
      keys.push(child.key);
    }
  });
  return keys;
}

export function parentMap<T = unknown>(nodes: readonly TxTreeNode<T>[]): Map<string, TxTreeNode<T> | null> {
  const parents = new Map<string, TxTreeNode<T> | null>();
  walkTree(nodes, (node, parent) => parents.set(node.key, parent));
  return parents;
}

export function normalizeChecked(nodes: readonly TxTreeNode[], keys: readonly string[]): string[] {
  const checked = new Set(keys);
  const settle = (node: TxTreeNode): boolean => {
    const children = (node.children ?? []).filter((child) => !child.disabled && child.selectable !== false);
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

export function isLeafNode(node: TxTreeNode): boolean {
  return node.leaf === false ? false : !node.children?.length;
}

export function nodeMatches(node: TxTreeNode, query: string, fields: readonly string[]): boolean {
  return fields.some((field) => foldText(String(readOptionField(node, field) ?? '')).includes(query));
}

export function filterTree<T = unknown>(nodes: readonly TxTreeNode<T>[], query: string, fields: readonly string[], mode: TxTreeFilterMode = 'lenient'): TxTreeNode<T>[] {
  const folded = foldText(query.trim());
  if (!folded) {
    return [...nodes];
  }
  const visit = (node: TxTreeNode<T>): TxTreeNode<T> | null => {
    const own = nodeMatches(node, folded, fields);
    const children = node.children ?? [];
    if (own && (mode === 'lenient' || !children.length)) {
      return node;
    }
    const kept = children.map(visit).filter((child): child is TxTreeNode<T> => child !== null);
    if (kept.length) {
      return { ...node, children: kept };
    }
    return own ? { ...node, children: [] } : null;
  };
  return nodes.map(visit).filter((node): node is TxTreeNode<T> => node !== null);
}

export function branchKeys(nodes: readonly TxTreeNode[]): string[] {
  const keys: string[] = [];
  walkTree(nodes, (node) => {
    if (node.children?.length) {
      keys.push(node.key);
    }
  });
  return keys;
}

export function isDescendantOf(nodes: readonly TxTreeNode[], ancestorKey: string, key: string): boolean {
  const ancestor = findNode(nodes, ancestorKey);
  if (!ancestor) {
    return false;
  }
  let found = false;
  walkTree(ancestor.children ?? [], (node) => {
    if (node.key === key) {
      found = true;
    }
  });
  return found;
}

export function removeNode<T = unknown>(nodes: readonly TxTreeNode<T>[], key: string): TxTreeNode<T>[] {
  return nodes
    .filter((node) => node.key !== key)
    .map((node) => {
      if (!node.children?.length) {
        return node;
      }
      const children = removeNode(node.children, key);
      return children.length === node.children.length && children.every((child, index) => child === node.children?.[index]) ? node : { ...node, children };
    });
}

export function insertNode<T = unknown>(
  nodes: readonly TxTreeNode<T>[],
  node: TxTreeNode<T>,
  targetKey: string | null,
  position: TxTreeDropPosition,
): TxTreeNode<T>[] {
  if (targetKey === null) {
    return [...nodes, node];
  }
  const index = nodes.findIndex((item) => item.key === targetKey);
  if (index >= 0) {
    if (position === 'inside') {
      const target = nodes[index];
      const result = [...nodes];
      result[index] = { ...target, children: [...(target.children ?? []), node] };
      return result;
    }
    const result = [...nodes];
    result.splice(position === 'before' ? index : index + 1, 0, node);
    return result;
  }
  return nodes.map((item) => (item.children?.length ? { ...item, children: insertNode(item.children, node, targetKey, position) } : item));
}

export function moveNode<T = unknown>(nodes: readonly TxTreeNode<T>[], key: string, targetKey: string | null, position: TxTreeDropPosition): TxTreeNode<T>[] {
  const node = findNode(nodes, key);
  if (!node || key === targetKey || (targetKey !== null && isDescendantOf(nodes, key, targetKey))) {
    return [...nodes];
  }
  return insertNode(removeNode(nodes, key), node, targetKey, position);
}

export function siblingsOf<T = unknown>(nodes: readonly TxTreeNode<T>[], key: string): readonly TxTreeNode<T>[] {
  const parent = parentMap(nodes).get(key);
  return parent ? (parent.children ?? []) : nodes;
}

export function scopesMatch(dragScope: TxTreeScope, dropScope: TxTreeScope): boolean {
  if (dropScope === null || dropScope === undefined) {
    return true;
  }
  if (dragScope === null || dragScope === undefined) {
    return false;
  }
  const drag = typeof dragScope === 'string' ? [dragScope] : dragScope;
  const drop = typeof dropScope === 'string' ? [dropScope] : dropScope;
  return drag.some((scope) => drop.includes(scope));
}
