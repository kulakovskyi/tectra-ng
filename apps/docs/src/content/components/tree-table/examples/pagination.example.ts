import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  selector: 'tree-table-pagination-example',
  imports: [TxTreeTable],
  template: `<tx-tree-table
    ariaLabel="Files"
    paginator
    [rows]="2"
    [rowsPerPageOptions]="[2, 4]"
    [value]="files"
    [columns]="columns"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTablePaginationExample {
  readonly files = FILES;
  readonly columns = COLUMNS;
}
