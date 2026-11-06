import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-expand-example',
  imports: [TxTree, TxButton],
  template: `
    <div class="stack">
      <div class="row">
        <button
          txButton
          type="button"
          severity="secondary"
          outlined
          label="Expand all"
          icon="plus"
          (click)="tree.expandAll()"
        ></button>
        <button
          txButton
          type="button"
          severity="secondary"
          outlined
          label="Collapse all"
          icon="minus"
          (click)="tree.collapseAll()"
        ></button>
      </div>
      <tx-tree #tree ariaLabel="Files" [value]="files" [(expandedKeys)]="expanded" />
      <span class="hint">Open: {{ expanded().join(', ') || '—' }}</span>
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      gap: 12px;
      max-width: 360px;
    }
    .row {
      display: flex;
      gap: 8px;
    }
    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeExpandExample {
  readonly expanded = signal<string[]>(['docs']);
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
