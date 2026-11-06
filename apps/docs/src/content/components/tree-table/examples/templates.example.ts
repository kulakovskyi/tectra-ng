import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTableCell } from '@tectra-ng/ui/table';
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

@Component({
  selector: 'tree-table-templates-example',
  imports: [TxTreeTable, TxTableCell, TxButton, TxIcon],
  template: `
    <div class="row">
      <button
        txButton
        type="button"
        severity="secondary"
        outlined
        size="small"
        label="Expand all"
        (click)="table.expandAll()"
      ></button>
      <button
        txButton
        type="button"
        severity="secondary"
        outlined
        size="small"
        label="Collapse all"
        (click)="table.collapseAll()"
      ></button>
    </div>
    <tx-tree-table
      #table
      ariaLabel="Files"
      [value]="files"
      [columns]="columns"
      [(expandedKeys)]="expanded"
    >
      <ng-template txTableCell="name" let-file let-node="node">
        <span class="name">
          <tx-icon [name]="node.children || node.leaf === false ? 'folder' : 'file'" />
          {{ file.name }}
        </span>
      </ng-template>
      <ng-template txTableCell="size" let-file>{{ file.size }} MB</ng-template>
    </tx-tree-table>
  `,
  styles: `
    .row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .name {
      display: inline-flex;
      gap: 8px;
      align-items: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTableTemplatesExample {
  readonly files = FILES;
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name', initialWidth: '260px' },
    { field: 'size', header: 'Size', align: 'end' },
  ];
  readonly expanded = signal<unknown[]>(['apps']);
}
