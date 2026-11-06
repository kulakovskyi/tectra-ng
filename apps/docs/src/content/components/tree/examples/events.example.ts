import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-events-example',
  imports: [TxTree],
  template: `
    <div class="grid">
      <tx-tree
        ariaLabel="Files with events"
        selectionMode="single"
        [value]="files"
        (nodeSelect)="log('Selected ' + $event.node.label)"
        (nodeUnselect)="log('Unselected ' + $event.node.label)"
        (nodeExpand)="log('Opened ' + $event.node.label)"
        (nodeCollapse)="log('Closed ' + $event.node.label)"
        (nodeDoubleClick)="log('Double click on ' + $event.node.label)"
      />
      <ol class="log" aria-live="polite">
        @for (line of lines(); track $index) {
          <li>{{ line }}</li>
        }
      </ol>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeEventsExample {
  readonly lines = signal<string[]>([]);

  log(line: string): void {
    this.lines.update((lines) => [line, ...lines].slice(0, 6));
  }
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
