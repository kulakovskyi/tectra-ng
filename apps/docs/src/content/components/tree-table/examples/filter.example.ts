import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
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
  selector: 'tree-table-filter-example',
  imports: [
    TxTreeTable,
    TxInput,
    TxToggleSwitch,
    FormsModule,
    TxIconField,
    TxInputIcon,
    TxInputClear,
  ],
  template: `
    <div class="row">
      <tx-icon-field>
        <tx-input-icon icon="search" />
        <input
          txInput
          type="search"
          aria-label="Search files"
          placeholder="Search files"
          [(ngModel)]="query"
        />
        <tx-input-clear />
      </tx-icon-field>
      <tx-toggle-switch label="Strict" [(ngModel)]="strict" />
    </div>
    <tx-tree-table
      ariaLabel="Files"
      [value]="files"
      [columns]="columns"
      [filterMode]="strict() ? 'strict' : 'lenient'"
      [globalFilter]="query()"
    />
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-bottom: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeTableFilterExample {
  readonly files = FILES;
  readonly columns: TxTableColumn[] = COLUMNS.map((column) => ({ ...column, filter: true }));
  readonly query = signal('');
  readonly strict = signal(false);
}
