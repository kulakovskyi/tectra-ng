import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-pass-through-example',
  imports: [TxTree],
  template: `
    <div class="grid">
      <tx-tree
        ariaLabel="Files with pass-through"
        [value]="files"
        [expandedKeys]="['docs']"
        [pt]="pt"
      />
      <tx-tree ariaLabel="Unstyled files" unstyled [value]="files" [expandedKeys]="['docs']" />
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreePassThroughExample {
  readonly pt = {
    root: { style: { border: '1px dashed var(--tx-surface-border)', borderRadius: '10px' } },
    label: { style: { fontWeight: '500' } },
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
