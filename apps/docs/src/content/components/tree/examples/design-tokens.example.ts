import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-design-tokens-example',
  imports: [TxTree],
  template: `<tx-tree
    ariaLabel="Files"
    selectionMode="single"
    [value]="files"
    [expandedKeys]="['docs', 'work']"
    [dt]="tokens"
  />`,
  styles: `
    tx-tree {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeDesignTokensExample {
  readonly tokens = {
    root: { indent: '24px', gap: '4px' },
    node: {
      borderRadius: '999px',
      padding: '6px 12px',
      selectedBackground: 'var(--tx-primary-base)',
      selectedColor: 'var(--tx-primary-contrast)',
    },
    nodeIcon: { selectedColor: 'var(--tx-primary-contrast)' },
  };
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
