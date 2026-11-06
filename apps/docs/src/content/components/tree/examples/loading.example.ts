import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { TxTree, TxTreeNode } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-loading-example',
  imports: [TxTree, TxToggleSwitch, FormsModule],
  template: `
    <div class="grid">
      <div class="stack">
        <strong>Mask</strong>
        <tx-toggle-switch label="Loading" [(ngModel)]="loading" />
        <tx-tree ariaLabel="Files loading" [loading]="loading" [value]="files" />
      </div>
      <div class="stack">
        <strong>Icon</strong>
        <tx-tree ariaLabel="Folders loading" loadingMode="icon" [value]="folders" />
      </div>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
export default class TreeLoadingExample {
  loading = true;
  readonly folders: TxTreeNode[] = [
    { key: 'sync', label: 'Syncing', icon: 'folder', leaf: false, loading: true },
    {
      key: 'done',
      label: 'Synced',
      icon: 'folder',
      children: [{ key: 'file', label: 'Notes.txt', icon: 'file' }],
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
