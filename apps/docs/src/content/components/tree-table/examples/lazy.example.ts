import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTableColumn } from '@tectra-ng/ui/table';
import { TxTreeTable, TxTreeTableNode } from '@tectra-ng/ui/tree-table';

interface File {
  name: string;
  size: number;
  type: string;
}

const COLUMNS: TxTableColumn[] = [
  { field: 'name', header: 'Name', initialWidth: '260px' },
  { field: 'size', header: 'Size, MB', align: 'end' },
  { field: 'type', header: 'Type' },
];

@Component({
  selector: 'tree-table-lazy-example',
  imports: [TxTreeTable],
  template: `<tx-tree-table
    ariaLabel="Folders loaded on demand"
    [value]="folders()"
    [columns]="columns"
    (nodeExpand)="load($event.node)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTableLazyExample {
  readonly columns = COLUMNS;
  readonly folders = signal<TxTreeTableNode<File>[]>(
    ['Projects', 'Reports', 'Shared'].map((name) => ({
      key: name,
      data: { name, size: 0, type: 'Folder' },
      leaf: false,
    })),
  );

  load(node: TxTreeTableNode<File>): void {
    if (node.children) return;
    setTimeout(() => {
      const children = [1, 2, 3].map((index) => ({
        key: `${node.key}-${index}`,
        data: {
          name: `${node.data.name.toLowerCase()}-${index}.pdf`,
          size: index * 4,
          type: 'Document',
        },
      }));
      this.folders.update((nodes) =>
        nodes.map((item) => (item.key === node.key ? { ...item, children } : item)),
      );
    }, 800);
  }
}
