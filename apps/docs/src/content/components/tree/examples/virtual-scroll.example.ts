import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-virtual-scroll-example',
  imports: [TxTree],
  template: `<tx-tree
    ariaLabel="Many nodes"
    virtualScroll
    scrollHeight="320px"
    [value]="nodes"
    [expandedKeys]="['g0']"
  />`,
  styles: `
    tx-tree {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeVirtualScrollExample {
  readonly nodes: TxTreeNode[] = Array.from({ length: 100 }, (_, group) => ({
    key: `g${group}`,
    label: `Group ${group + 1}`,
    icon: 'folder',
    children: Array.from({ length: 100 }, (_, item) => ({
      key: `g${group}-${item}`,
      label: `Item ${group + 1}.${item + 1}`,
      icon: 'file',
    })),
  }));
}
