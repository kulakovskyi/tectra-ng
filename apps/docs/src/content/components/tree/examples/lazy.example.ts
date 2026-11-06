import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTree, TxTreeNode, TxTreeNodeEvent } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-lazy-example',
  imports: [TxTree],
  template: `<tx-tree
    ariaLabel="Folders loaded on demand"
    [(value)]="folders"
    (nodeExpand)="load($event)"
  />`,
  styles: `
    tx-tree {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeLazyExample {
  readonly folders = signal<TxTreeNode[]>([
    { key: 'a', label: 'Archive', icon: 'folder', leaf: false },
    { key: 'b', label: 'Backups', icon: 'folder', leaf: false },
    { key: 'c', label: 'Clients', icon: 'folder', leaf: false },
  ]);

  load({ node }: TxTreeNodeEvent): void {
    if (node.children) return;
    setTimeout(() => {
      const children: TxTreeNode[] = [1, 2, 3].map((index) => ({
        key: `${node.key}-${index}`,
        label: `${node.label} ${index}`,
        icon: index === 3 ? 'folder' : 'file',
        leaf: index !== 3,
      }));
      this.folders.update((nodes) => this.attach(nodes, node.key, children));
    }, 800);
  }

  private attach(nodes: TxTreeNode[], key: string, children: TxTreeNode[]): TxTreeNode[] {
    return nodes.map((item) =>
      item.key === key
        ? { ...item, children }
        : item.children
          ? { ...item, children: this.attach(item.children, key, children) }
          : item,
    );
  }
}
