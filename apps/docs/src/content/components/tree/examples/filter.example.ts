import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-filter-example',
  imports: [TxTree],
  template: `
    <div class="grid">
      <div class="stack">
        <strong>Lenient</strong>
        <tx-tree
          ariaLabel="Files, lenient search"
          filter
          filterPlaceholder="Search files"
          [value]="files"
        />
      </div>
      <div class="stack">
        <strong>Strict</strong>
        <tx-tree
          ariaLabel="Files, strict search"
          filter
          filterMode="strict"
          filterPlaceholder="Search files"
          [value]="files"
        />
      </div>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .stack {
      display: grid;
      gap: 8px;
      align-content: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeFilterExample {
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
