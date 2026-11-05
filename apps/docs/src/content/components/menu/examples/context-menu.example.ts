import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxContextMenu, TxMenuItem, TxMenuItemEvent } from '@tectra/ui/menu';

interface StoredFile {
  name: string;
  size: string;
}

@Component({
  selector: 'menu-context-menu-example',
  imports: [TxContextMenu],
  template: `
    <table #table class="files" aria-label="Files">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        @for (file of files(); track file.name) {
          <tr
            tabindex="0"
            [class.selected]="selected() === file"
            (contextmenu)="selected.set(file)"
            (focus)="selected.set(file)"
          >
            <td>{{ file.name }}</td>
            <td>{{ file.size }}</td>
          </tr>
        }
      </tbody>
    </table>
    <p class="hint">Right-click a row, or focus it and press Shift + F10.</p>
    <tx-context-menu
      ariaLabel="File actions"
      [target]="table"
      [model]="items"
      (itemSelected)="run($event)"
    />
  `,
  styles: `
    .files {
      width: 100%;
      max-width: 420px;
      border-collapse: collapse;
    }
    .files th,
    .files td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--tx-surface-border);
      text-align: start;
    }
    .files tbody tr {
      cursor: context-menu;
    }
    .files tbody tr:focus-visible {
      outline: 2px solid var(--tx-focus-ring-color);
      outline-offset: -2px;
    }
    .selected {
      background: var(--tx-highlight-background);
    }
    .hint {
      margin: 8px 0 0;
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuContextMenuExample {
  readonly files = signal<StoredFile[]>([
    { name: 'Q3 report.pdf', size: '2.4 MB' },
    { name: 'Roadmap.xlsx', size: '310 KB' },
    { name: 'Logo.svg', size: '12 KB' },
  ]);
  readonly selected = signal<StoredFile | null>(null);
  readonly items: TxMenuItem[] = [
    { id: 'open', label: 'Open', icon: 'eye' },
    { id: 'download', label: 'Download', icon: 'download' },
    {
      label: 'Share',
      icon: 'share-alt',
      items: [
        { label: 'Copy link', icon: 'link' },
        { label: 'Email', icon: 'send' },
      ],
    },
    { separator: true },
    { id: 'delete', label: 'Delete', icon: 'trash', severity: 'danger' },
  ];

  run({ item }: TxMenuItemEvent): void {
    const file = this.selected();
    if (item.id === 'delete' && file) {
      this.files.update((files) => files.filter((other) => other !== file));
    }
  }
}
