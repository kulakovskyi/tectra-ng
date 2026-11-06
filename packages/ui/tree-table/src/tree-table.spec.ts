import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTableCell, TxTableColumn, TxTableFilters, TxTableSelectionMode } from '@tectra-ng/ui/table';
import { TxTreeTable, filterTreeTable } from './tree-table.component';
import { TxTreeTableNode } from './tree-table.types';

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
      { key: 'editor', data: { name: 'Editor', size: 200, type: 'Application' } },
      { key: 'player', data: { name: 'Player', size: 100, type: 'Application' } },
    ],
  },
  {
    key: 'cloud',
    data: { name: 'Cloud', size: 20, type: 'Folder' },
    children: [{ key: 'backup', data: { name: 'Backup', size: 20, type: 'Zip' } }],
  },
  { key: 'remote', data: { name: 'Remote', size: 0, type: 'Folder' }, leaf: false },
];

const COLUMNS: TxTableColumn[] = [
  { field: 'name', header: 'Name' },
  { field: 'size', header: 'Size' },
  { field: 'type', header: 'Type', sortable: false },
];

@Component({
  imports: [TxTreeTable, TxTableCell],
  template: `<tx-tree-table
    ariaLabel="Files"
    [value]="value()"
    [columns]="columns"
    [selectionMode]="mode()"
    [(selection)]="selection"
    [(expandedKeys)]="expanded"
    [(filters)]="filters"
    [paginator]="paginator()"
    [rows]="1"
    (nodeExpand)="expandedEvents.push($event.node.key ?? '')"
  >
    <ng-template txTableCell="type" let-file let-node="node">{{ file.type }}/{{ node.key }}</ng-template>
  </tx-tree-table>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal(FILES);
  readonly columns = COLUMNS;
  readonly mode = signal<TxTableSelectionMode | undefined>(undefined);
  readonly selection = signal<TxTreeTableNode<File> | TxTreeTableNode<File>[] | null>(null);
  readonly expanded = signal<unknown[]>([]);
  readonly filters = signal<TxTableFilters>({});
  readonly paginator = signal(false);
  expandedEvents: string[] = [];
}

function rowOf(tree: TxTreeTable<File>, key: string) {
  const found = tree.renderRows().find((item) => item.key === key);
  if (!found) throw new Error(`No row ${key}`);
  return found;
}

describe('TxTreeTable', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const rows = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-table__tbody > .tx-table__row:not(.tx-table__row--collapsed)')) as HTMLElement[];
  const names = () => rows().map((row) => row.querySelector('[data-field="name"] .tx-table__tree-content')?.textContent?.trim());
  const row = (key: string) => rows().find((item) => item.dataset['key'] === key) as HTMLElement;
  const toggle = async (key: string) => {
    (row(key).querySelector('.tx-table__tree-toggle') as HTMLButtonElement).click();
    await render();
  };
  const key = async (name: string, target: HTMLElement) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await render();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await render();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('renders root nodes as a tree grid with levels', () => {
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;
    expect(table.getAttribute('role')).toBe('treegrid');
    expect(names()).toEqual(['Applications', 'Cloud', 'Remote']);
    expect(row('apps').getAttribute('aria-level')).toBe('1');
    expect(row('apps').getAttribute('aria-expanded')).toBe('false');
    expect(row('apps').getAttribute('aria-setsize')).toBe('3');
    expect(row('apps').getAttribute('tabindex')).toBe('0');
    expect(row('remote').getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('tx-tree-table').classList).toContain('tx-tree-table');
  });

  it('expands children with the toggler and passes data and node to cell templates', async () => {
    await toggle('apps');
    expect(host.expanded()).toEqual(['apps']);
    expect(host.expandedEvents).toEqual(['apps']);
    expect(names()).toEqual(['Applications', 'Editor', 'Player', 'Cloud', 'Remote']);
    expect(row('editor').getAttribute('aria-level')).toBe('2');
    expect(row('editor').querySelector('[data-field="type"]')?.textContent?.trim()).toBe('Application/editor');
    expect((row('editor').querySelector('.tx-table__tree-cell') as HTMLElement).style.getPropertyValue('--tx-table-tree-level')).toBe('1');
    await toggle('apps');
    expect(names()).toEqual(['Applications', 'Cloud', 'Remote']);
  });

  it('expands and collapses with the arrow keys and moves to the parent', async () => {
    await key('ArrowRight', row('apps'));
    expect(host.expanded()).toEqual(['apps']);
    await key('ArrowRight', row('apps'));
    expect(document.activeElement).toBe(row('editor'));
    await key('ArrowLeft', row('editor'));
    expect(document.activeElement).toBe(row('apps'));
    await key('ArrowLeft', row('apps'));
    expect(host.expanded()).toEqual([]);
  });

  it('sorts siblings on every level', async () => {
    host.expanded.set(['apps']);
    await render();
    (fixture.nativeElement.querySelector('th[data-field="size"] .tx-table__sort') as HTMLButtonElement).click();
    await render();
    expect(names()).toEqual(['Remote', 'Cloud', 'Applications', 'Player', 'Editor']);
  });

  it('pages root nodes', async () => {
    host.paginator.set(true);
    host.expanded.set(['apps']);
    await render();
    expect(names()).toEqual(['Applications', 'Editor', 'Player']);
  });

  it('keeps parents of filtered rows and opens them', async () => {
    host.filters.set({ name: { operator: 'and', rules: [{ matchMode: 'contains', value: 'back' }] } });
    await render();
    expect(names()).toEqual(['Cloud', 'Backup']);
    expect(host.expanded()).toEqual([]);
  });

  it('propagates checkbox selection with a partial parent and a select-all header', async () => {
    host.mode.set('checkbox');
    host.expanded.set(['apps']);
    await render();
    expect(fixture.nativeElement.querySelector('th.tx-table__select-column, th[data-field="__select"]')).toBeNull();
    const tree = fixture.debugElement.children[0].componentInstance as TxTreeTable<File>;
    tree.toggleRow(rowOf(tree, 'editor'));
    await render();
    expect(tree.renderRows().find((item) => item.key === 'apps')?.tree?.partial).toBe(true);
    tree.toggleRow(rowOf(tree, 'player'));
    await render();
    expect((host.selection() as TxTreeTableNode<File>[]).map((node) => node.key)).toEqual(['apps', 'editor', 'player']);
    tree.toggleRow(rowOf(tree, 'apps'));
    await render();
    expect(host.selection()).toEqual([]);
    tree.toggleAll(true);
    await render();
    expect((host.selection() as TxTreeTableNode<File>[]).length).toBe(6);
    expect(tree.allSelected()).toBe(true);
    expect(fixture.nativeElement.querySelector('.tx-table__tree-select-all')).not.toBeNull();
  });

  it('shows a loader on a lazy node until its children arrive', async () => {
    await toggle('remote');
    expect(row('remote').getAttribute('aria-busy')).toBe('true');
    host.value.update((nodes) => nodes.map((node) => (node.key === 'remote' ? { ...node, children: [{ key: 'old', data: { name: 'Old', size: 1, type: 'Zip' } }] } : node)));
    await render();
    expect(row('remote').getAttribute('aria-busy')).toBeNull();
    expect(names()).toContain('Old');
  });

  it('exports every node to csv', () => {
    const tree = fixture.debugElement.children[0].componentInstance as TxTreeTable<File>;
    const csv = tree.exportCSV();
    expect(csv.split('\r\n')).toEqual(['Name,Size,Type', 'Applications,300,Folder', 'Editor,200,Application', 'Player,100,Application', 'Cloud,20,Folder', 'Backup,20,Zip', 'Remote,0,Folder']);
  });
});

describe('filterTreeTable', () => {
  it('keeps whole matching branches in lenient mode and filters them in strict mode', () => {
    const match = (node: TxTreeTableNode<File>) => node.data.name.startsWith('App') || node.data.name === 'Player';
    expect(filterTreeTable(FILES, match)[0].children?.length).toBe(2);
    expect(filterTreeTable(FILES, match, 'strict')[0].children?.map((node) => node.key)).toEqual(['player']);
  });
});
