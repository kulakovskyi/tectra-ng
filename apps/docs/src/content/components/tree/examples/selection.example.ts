import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { TxTree, TxTreeNode, TxTreeSelection } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-selection-example',
  imports: [TxTree, TxToggleSwitch, FormsModule],
  template: `
    <div class="grid">
      <div class="stack">
        <strong>Single</strong>
        <tx-tree
          ariaLabel="Files, single selection"
          selectionMode="single"
          [value]="files"
          [(selection)]="single"
        />
        <span class="hint">Selected: {{ single()?.label ?? '—' }}</span>
      </div>
      <div class="stack">
        <label class="row" for="tree-selection-meta">
          <tx-toggle-switch inputId="tree-selection-meta" [(ngModel)]="meta" />
          <strong>Multiple, meta key</strong>
        </label>
        <tx-tree
          ariaLabel="Files, multiple selection"
          selectionMode="multiple"
          [metaKeySelection]="meta"
          [value]="files"
          [(selection)]="multiple"
        />
        <span class="hint">Selected: {{ multipleLabels() }}</span>
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
    .row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeSelectionExample {
  readonly single = signal<TxTreeNode | null>(null);
  readonly multiple = signal<TxTreeSelection>([]);
  meta = true;
  readonly multipleLabels = computed(() => {
    const nodes = this.multiple();
    return Array.isArray(nodes) && nodes.length ? nodes.map((node) => node.label).join(', ') : '—';
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
