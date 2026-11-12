import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTableCell, TxTableColumn, TxTableFilters, TxTableRenderRow, TxTableSelectionMode } from '@tectra-ng/ui/table';
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

interface Item {
  id: number;
  name: string;
}

const ITEMS: TxTreeTableNode<Item>[] = [
  {
    data: { id: 1, name: 'Fruit' },
    children: [
      { data: { id: 2, name: 'Apple' } },
      { data: { id: 3, name: 'Pear' }, selectable: false },
    ],
  },
  {
    data: { id: 4, name: 'Vegetables' },
    expanded: true,
    children: [{ data: { id: 5, name: 'Carrot' } }],
  },
  { data: { id: 6, name: 'Bread' } },
];

@Component({
  imports: [TxTreeTable],
  template: `<tx-tree-table
    ariaLabel="Food"
    [dataKey]="dataKey()"
    [value]="value()"
    [columns]="columns()"
    [selectionMode]="mode()"
    [(selection)]="selection"
    [selectAll]="selectAll()"
    [rowSelectable]="selectable()"
    [propagateSelectionDown]="down()"
    [(expandedKeys)]="expanded"
    [(globalFilter)]="search"
    [lazy]="lazy()"
    [virtualScroll]="virtual()"
    [reorderableRows]="true"
    (selectAllChange)="allChanges.push($event)"
    (nodeCollapse)="collapsed.push($event.node.data.name)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FoodHost {
  readonly dataKey = signal<string | undefined>('id');
  readonly value = signal<TxTreeTableNode<Item>[] | null>(ITEMS);
  readonly columns = signal<TxTableColumn[]>([{ field: 'name', header: 'Name' }]);
  readonly mode = signal<TxTableSelectionMode | undefined>(undefined);
  readonly selection = signal<TxTreeTableNode<Item> | TxTreeTableNode<Item>[] | null>(null);
  readonly selectAll = signal<boolean | undefined>(undefined);
  readonly selectable = signal<((node: TxTreeTableNode<Item>) => boolean) | undefined>(undefined);
  readonly down = signal(true);
  readonly expanded = signal<unknown[]>([]);
  readonly search = signal('');
  readonly lazy = signal(false);
  readonly virtual = signal(false);
  readonly allChanges: boolean[] = [];
  readonly collapsed: string[] = [];
}

describe('TxTreeTable keyboard, expansion and selection', () => {
  let fixture: ComponentFixture<FoodHost>;
  let host: FoodHost;
  let tree: TxTreeTable<Item>;
  const rows = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.tx-table__tbody > .tx-table__row:not(.tx-table__row--collapsed)')];
  const names = () => rows().map((row) => row.querySelector('[data-field="name"] .tx-table__tree-content')?.textContent?.trim());
  const row = (name: string) => rows().find((item) => item.querySelector('.tx-table__tree-content')?.textContent?.trim() === name) as HTMLElement;
  const item = (id: number) => tree.renderRows().find((entry) => entry.key === id) as TxTableRenderRow<TxTreeTableNode<Item>>;
  const selectedIds = () => {
    const selection = host.selection();
    return (Array.isArray(selection) ? selection : selection ? [selection] : []).map((node) => node.data.id);
  };
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const key = async (name: string, target: HTMLElement) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await stable();
  };
  const create = async (setup: (host: FoodHost) => void = () => undefined) => {
    fixture = TestBed.createComponent(FoodHost);
    host = fixture.componentInstance;
    setup(host);
    fixture.autoDetectChanges();
    await stable();
    tree = fixture.debugElement.query((node) => node.componentInstance instanceof TxTreeTable).componentInstance as TxTreeTable<Item>;
  };

  afterEach(() => fixture.destroy());

  it('opens nodes marked as expanded and finds nodes by their data key', async () => {
    await create();
    expect(host.expanded()).toEqual([4]);
    expect(names()).toEqual(['Fruit', 'Vegetables', 'Carrot', 'Bread']);
    expect(row('Carrot').getAttribute('aria-level')).toBe('2');
  });

  it('moves through visible rows with the arrow keys, Home and End', async () => {
    await create();
    await key('ArrowUp', row('Fruit'));
    expect(document.activeElement).not.toBe(row('Fruit'));
    await key('ArrowDown', row('Fruit'));
    expect(document.activeElement).toBe(row('Vegetables'));
    await key('End', row('Vegetables'));
    expect(document.activeElement).toBe(row('Bread'));
    await key('Home', row('Bread'));
    expect(document.activeElement).toBe(row('Fruit'));
    await key('ArrowRight', row('Bread'));
    await key('ArrowLeft', row('Bread'));
    await key(' ', row('Bread'));
    expect(host.expanded()).toEqual([4]);
    expect(host.selection()).toBeNull();
  });

  it('skips rows that are still closing and opens a closing node again', async () => {
    await create();
    await key('ArrowLeft', row('Vegetables'));
    expect(host.collapsed).toEqual(['Vegetables']);
    expect(fixture.nativeElement.querySelector('.tx-table__row--collapsed')).toBeTruthy();
    await key('ArrowDown', row('Vegetables'));
    expect(document.activeElement).toBe(row('Bread'));
    tree.expandNode(item(4));
    await stable();
    expect(host.expanded()).toEqual([4]);
    await new Promise((resolve) => setTimeout(resolve, 450));
    await stable();
    expect(names()).toEqual(['Fruit', 'Vegetables', 'Carrot', 'Bread']);
  });

  it('expands and collapses every node and ignores toggles that change nothing', async () => {
    await create();
    tree.expandAll();
    await stable();
    expect(names()).toEqual(['Fruit', 'Apple', 'Pear', 'Vegetables', 'Carrot', 'Bread']);
    tree.toggleNode(item(6), new MouseEvent('click'));
    tree.expandNode(item(6));
    tree.expandNode(item(1));
    tree.collapseNode(item(6));
    await stable();
    expect(host.expanded()).toEqual([1, 4]);
    tree.collapseAll();
    await stable();
    expect(names()).toEqual(['Fruit', 'Vegetables', 'Bread']);
  });

  it('opens and closes nodes at once with virtual scroll', async () => {
    await create((own) => own.virtual.set(true));
    await key('ArrowRight', row('Fruit'));
    expect(names()).toEqual(['Fruit', 'Apple', 'Pear', 'Vegetables', 'Carrot', 'Bread']);
    await key('ArrowLeft', row('Fruit'));
    expect(fixture.nativeElement.querySelectorAll('.tx-table__tbody > .tx-table__row')).toHaveLength(4);
  });

  it('opens and closes matched branches while a filter is on', async () => {
    await create();
    host.search.set('apple');
    await stable();
    expect(names()).toEqual(['Fruit', 'Apple']);
    await key('ArrowLeft', row('Fruit'));
    expect(names()).toEqual(['Fruit']);
    await key('ArrowRight', row('Fruit'));
    expect(names()).toEqual(['Fruit', 'Apple']);
    expect(host.expanded()).toEqual([4]);
  });

  it('leaves filtering to the server in lazy mode', async () => {
    await create((own) => own.lazy.set(true));
    host.search.set('apple');
    await stable();
    expect(names()).toEqual(['Fruit', 'Vegetables', 'Carrot', 'Bread']);
  });

  it('selects one node with Enter and compares nodes by data without a data key', async () => {
    await create((own) => {
      own.mode.set('single');
      own.dataKey.set(undefined);
    });
    await key('Enter', row('Bread'));
    expect(selectedIds()).toEqual([6]);
    expect(row('Bread').getAttribute('aria-selected')).toBe('true');
    expect(tree.someSelected()).toBe(true);
  });

  it('checks a branch without its children, skips locked nodes and keeps an own select-all state', async () => {
    await create((own) => {
      own.mode.set('checkbox');
      own.down.set(false);
      own.selectable.set((node) => node.data.id !== 6);
      own.expanded.set([1, 4]);
    });
    tree.toggleRow(item(5));
    await stable();
    expect(selectedIds()).toEqual([4, 5]);
    tree.toggleRow(item(1));
    await stable();
    expect(selectedIds()).toEqual([4, 5]);
    tree.toggleRow(item(6));
    tree.toggleRow(item(3));
    await stable();
    expect(selectedIds()).toEqual([4, 5]);
    tree.toggleAll(false);
    await stable();
    expect(host.selection()).toEqual([]);
    host.selectAll.set(true);
    await stable();
    expect(tree.allSelected()).toBe(true);
    expect(tree.someSelected()).toBe(false);
    tree.toggleAll(false);
    expect(host.allChanges).toEqual([false, false]);
    expect(host.selection()).toEqual([]);
  });

  it('keeps child rows in place when a drop would move them out of their branch', async () => {
    await create();
    tree.dropRow({ previousIndex: 2, currentIndex: 0 } as never);
    await stable();
    expect(names()).toEqual(['Fruit', 'Vegetables', 'Carrot', 'Bread']);
  });

  it('renders no tree toggles without columns and nothing without a value', async () => {
    await create((own) => own.columns.set([]));
    expect(tree.treeField()).toBeNull();
    host.value.set(null);
    await stable();
    expect(tree.allNodes()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.tx-table__empty')).toBeTruthy();
  });
});

describe('filterTreeTable in strict mode', () => {
  it('keeps a matching parent without children when none of them match', () => {
    const result = filterTreeTable(ITEMS, (node) => node.data.name === 'Fruit', 'strict');
    expect(result).toEqual([{ ...ITEMS[0], children: [] }]);
  });
});
