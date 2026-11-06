import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTableLazyLoadEvent } from '@tectra-ng/ui/table';
import { TxTableColumn } from '@tectra-ng/ui/table';
import { TxTreeTable, TxTreeTableNode } from '@tectra-ng/ui/tree-table';

interface File {
  name: string;
  size: number;
  type: string;
}

const FILES: TxTreeTableNode<File>[] = [
  {
    key: 'apps',
    data: { name: 'Applications', size: 300, type: 'Folder' },
    children: [
      {
        key: 'editor',
        data: { name: 'Editor', size: 220, type: 'Folder' },
        children: [
          { key: 'editor-app', data: { name: 'editor.app', size: 180, type: 'Application' } },
          { key: 'editor-docs', data: { name: 'editor-docs.pdf', size: 40, type: 'Document' } },
        ],
      },
      { key: 'player', data: { name: 'Player', size: 80, type: 'Application' } },
    ],
  },
  {
    key: 'cloud',
    data: { name: 'Cloud', size: 50, type: 'Folder' },
    children: [
      { key: 'backup', data: { name: 'backup-2025.zip', size: 30, type: 'Archive' } },
      { key: 'photos', data: { name: 'photos.zip', size: 20, type: 'Archive' } },
    ],
  },
  {
    key: 'desktop',
    data: { name: 'Desktop', size: 12, type: 'Folder' },
    children: [
      { key: 'notes', data: { name: 'notes.txt', size: 2, type: 'Text' } },
      { key: 'plan', data: { name: 'plan.xlsx', size: 10, type: 'Spreadsheet' } },
    ],
  },
  {
    key: 'music',
    data: { name: 'Music', size: 640, type: 'Folder' },
    children: [
      {
        key: 'album',
        data: { name: 'Album', size: 640, type: 'Folder' },
        children: [{ key: 'track', data: { name: 'track-01.mp3', size: 8, type: 'Audio' } }],
      },
    ],
  },
];

const COLUMNS: TxTableColumn[] = [
  { field: 'name', header: 'Name', initialWidth: '260px' },
  { field: 'size', header: 'Size, MB', align: 'end' },
  { field: 'type', header: 'Type' },
];

@Component({
  selector: 'tree-table-server-example',
  imports: [TxTreeTable],
  template: `
    <tx-tree-table
      ariaLabel="Files from the server"
      lazy
      paginator
      [rows]="2"
      [value]="page()"
      [columns]="columns"
      [totalRecords]="total"
      [loading]="loading()"
      (lazyLoad)="load($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTableServerExample {
  readonly columns = COLUMNS;
  readonly total = FILES.length;
  readonly page = signal<TxTreeTableNode<File>[]>([]);
  readonly loading = signal(false);

  load(event: TxTableLazyLoadEvent): void {
    this.loading.set(true);
    setTimeout(() => {
      const direction = event.sortOrder === 'desc' ? -1 : 1;
      const field = event.sortField as keyof File | null;
      const sorted = field
        ? [...FILES].sort((a, b) => (a.data[field] > b.data[field] ? direction : -direction))
        : FILES;
      this.page.set(sorted.slice(event.first, event.first + event.rows));
      this.loading.set(false);
    }, 600);
  }
}
