import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxToastService } from '@tectra-ng/ui/toast';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-context-menu-example',
  imports: [TxTree],
  template: `
    <tx-tree
      class="tree"
      ariaLabel="Files with a menu"
      selectionMode="single"
      [value]="files"
      [contextMenu]="items"
      [(contextMenuSelection)]="target"
    />
  `,
  styles: `
    .tree {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeContextMenuExample {
  private readonly toast = inject(TxToastService);
  readonly target = signal<TxTreeNode | null>(null);
  readonly items: TxMenuItem[] = [
    {
      label: 'Open',
      icon: 'external-link',
      command: () => this.toast.info(`Opened ${this.target()?.label}`),
    },
    {
      label: 'Rename',
      icon: 'pencil',
      command: () => this.toast.info(`Renaming ${this.target()?.label}`),
    },
    { separator: true },
    {
      label: 'Delete',
      icon: 'trash',
      command: () => this.toast.success(`Deleted ${this.target()?.label}`),
    },
  ];
  readonly files: TxTreeNode[] = [
    {
      key: 'docs',
      label: 'Documents',
      icon: 'folder',
      children: [
        {
          key: 'work',
          label: 'Work',
          icon: 'folder',
          children: [
            { key: 'expenses', label: 'Expenses.xlsx', icon: 'file-excel' },
            { key: 'resume', label: 'Resume.pdf', icon: 'file-pdf' },
          ],
        },
        {
          key: 'home',
          label: 'Home',
          icon: 'folder',
          children: [{ key: 'invoices', label: 'Invoices.txt', icon: 'file' }],
        },
      ],
    },
    {
      key: 'events',
      label: 'Events',
      icon: 'calendar',
      children: [
        { key: 'meeting', label: 'Meeting', icon: 'calendar-plus' },
        { key: 'review', label: 'Product review', icon: 'calendar-plus' },
      ],
    },
    {
      key: 'movies',
      label: 'Movies',
      icon: 'video',
      children: [
        { key: 'classics', label: 'Classics', icon: 'star' },
        { key: 'series', label: 'Series', icon: 'star' },
      ],
    },
  ];
}
