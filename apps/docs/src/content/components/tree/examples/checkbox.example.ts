import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxTree, TxTreeNode, TxTreeSelection } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-checkbox-example',
  imports: [TxTree],
  template: `
    <div class="grid">
      <div class="stack">
        <strong>Whole branches</strong>
        <tx-tree
          ariaLabel="Files with checkboxes"
          selectionMode="checkbox"
          [value]="files"
          [(selection)]="checked"
          [expandedKeys]="['docs', 'work']"
        />
        <span class="hint">{{ count() }} checked</span>
      </div>
      <div class="stack">
        <strong>Nodes on their own</strong>
        <tx-tree
          ariaLabel="Files with independent checkboxes"
          selectionMode="checkbox"
          highlightOnSelect
          [propagateSelectionUp]="false"
          [propagateSelectionDown]="false"
          [value]="files"
          [expandedKeys]="['docs', 'work']"
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
    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeCheckboxExample {
  readonly checked = signal<TxTreeSelection>([]);
  readonly count = computed(() => {
    const nodes = this.checked();
    return Array.isArray(nodes) ? nodes.length : 0;
  });
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
