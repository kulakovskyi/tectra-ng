import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxTable } from './table.component';
import { TxTableCell } from './table.templates';
import { TxSortMeta, TxTableColumn, TxTableLazyLoadEvent, TxTableSelectionMode, TxTableSortEvent, TxTableSortMode } from './table.types';

interface Person {
  id: number;
  name: string;
  city: string;
  age: number;
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Olena', city: 'Lviv', age: 34 },
  { id: 2, name: 'Andrii', city: 'Kyiv', age: 28 },
  { id: 3, name: 'Iryna', city: 'Odesa', age: 41 },
  { id: 4, name: 'Bohdan', city: 'Kyiv', age: 23 },
];

@Component({
  imports: [TxTable, TxTableCell],
  template: `
    <tx-table
      ariaLabel="People"
      [dataKey]="dataKey()"
      [value]="people"
      [columns]="columns"
      [responsive]="false"
      [selectionMode]="mode()"
      [(selection)]="selection"
      [metaKeySelection]="metaKey()"
      [rowSelectable]="selectable()"
      [selectAll]="selectAll()"
      [sortMode]="sortMode()"
      [(multiSortMeta)]="sortMeta"
      [lazy]="lazy()"
      [paginator]="paginator()"
      [(first)]="first"
      [rows]="2"
      [contextMenu]="menu()"
      [rowContextMenu]="rowMenu()"
      [(contextMenuSelection)]="menuRow"
      [exportFunction]="exportFn()"
      (rowClick)="clicks.push($event.row.id)"
      (rowSelect)="selects.push($event.row.id)"
      (rowUnselect)="unselects.push($event.row.id)"
      (selectAllChange)="allChanges.push($event)"
      (sortChange)="sorts.push($event)"
      (lazyLoad)="loads.push($event)"
      (contextMenuSelect)="menuSelects.push($event.row.id)"
    >
      <ng-template txTableCell="city" let-person>
        <button type="button" class="city">{{ person.city }}</button>
        <input class="note" aria-label="Note" />
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly people = PEOPLE;
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'city', header: 'City' },
    { field: 'age', header: 'Age' },
  ];
  readonly dataKey = signal<string | undefined>('id');
  readonly mode = signal<TxTableSelectionMode | undefined>('multiple');
  readonly selection = signal<Person | Person[] | null>(null);
  readonly metaKey = signal(true);
  readonly selectable = signal<((row: Person) => boolean) | undefined>(undefined);
  readonly selectAll = signal<boolean | undefined>(undefined);
  readonly sortMode = signal<TxTableSortMode>('single');
  readonly sortMeta = signal<TxSortMeta[]>([]);
  readonly lazy = signal(false);
  readonly paginator = signal(false);
  readonly first = signal(0);
  readonly menu = signal<TxMenuItem[] | undefined>(undefined);
  readonly rowMenu = signal(true);
  readonly menuRow = signal<Person | null>(null);
  readonly exportFn = signal<((row: Person, column: TxTableColumn) => unknown) | undefined>(undefined);
  readonly clicks: number[] = [];
  readonly selects: number[] = [];
  readonly unselects: number[] = [];
  readonly allChanges: boolean[] = [];
  readonly sorts: TxTableSortEvent[] = [];
  readonly loads: TxTableLazyLoadEvent[] = [];
  readonly menuSelects: number[] = [];
}

describe('TxTable selection, sorting and the context menu', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let table: TxTable<Person>;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const rows = () => [...root().querySelectorAll<HTMLElement>('tbody .tx-table__row')];
  const names = () => rows().map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
  const selectedIds = () => {
    const selection = host.selection();
    return Array.isArray(selection) ? selection.map((person) => person.id) : selection ? [selection.id] : [];
  };
  const click = (target: Element, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
  const keydown = (target: Element, key: string, init: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
  const sortBy = (field: string, init: MouseEventInit = {}) => click(root().querySelector(`th[data-field="${field}"] .tx-table__sort`) as HTMLElement, init);
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
    table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Person>;
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('keeps a single selection on a second click and clears it with the meta key', async () => {
    host.mode.set('single');
    await stable();
    click(rows()[1]);
    await stable();
    expect(selectedIds()).toEqual([2]);
    expect(rows()[1].getAttribute('aria-selected')).toBe('true');
    click(rows()[1]);
    await stable();
    expect(selectedIds()).toEqual([2]);
    click(rows()[1], { metaKey: true });
    await stable();
    expect(host.selection()).toBeNull();
    expect(host.selects).toEqual([2]);
    expect(host.unselects).toEqual([2]);
  });

  it('toggles rows one by one without the meta key', async () => {
    host.metaKey.set(false);
    await stable();
    click(rows()[0]);
    click(rows()[2]);
    await stable();
    expect(selectedIds()).toEqual([1, 3]);
    click(rows()[0]);
    await stable();
    expect(selectedIds()).toEqual([3]);
  });

  it('clears the only selected row on a plain click and selects ranges with Shift', async () => {
    click(rows()[1]);
    await stable();
    click(rows()[1]);
    await stable();
    expect(selectedIds()).toEqual([]);
    expect(host.unselects).toEqual([2]);
    click(rows()[3]);
    await stable();
    click(rows()[1], { shiftKey: true });
    await stable();
    expect(selectedIds()).toEqual([2, 3, 4]);
    host.selection.set(PEOPLE[0]);
    await stable();
    click(rows()[0]);
    await stable();
    expect(selectedIds()).toEqual([]);
  });

  it('moves the focus with the arrow keys, Home and End and selects with Shift, Enter and Ctrl+A', async () => {
    click(rows()[2]);
    await stable();
    keydown(rows()[2], 'ArrowUp');
    await stable();
    expect(document.activeElement).toBe(rows()[1]);
    keydown(rows()[1], 'Home');
    await stable();
    expect(document.activeElement).toBe(rows()[0]);
    keydown(rows()[0], 'End');
    await stable();
    expect(document.activeElement).toBe(rows()[3]);
    keydown(rows()[3], 'ArrowUp', { shiftKey: true });
    await stable();
    expect(selectedIds()).toEqual([3]);
    keydown(rows()[2], 'Enter');
    await stable();
    expect(selectedIds()).toEqual([]);
    keydown(rows()[2], 'a');
    await stable();
    expect(selectedIds()).toEqual([]);
    keydown(rows()[2], 'a', { ctrlKey: true });
    await stable();
    expect(selectedIds()).toEqual([1, 2, 3, 4]);
    keydown(rows()[2], 'a', { metaKey: true });
    await stable();
    expect(selectedIds()).toEqual([]);
    keydown(rows()[2].querySelector('.city') as HTMLElement, 'ArrowDown');
    await stable();
    expect(document.activeElement).not.toBe(rows()[3]);
  });

  it('selects a range down from the anchor and from the focused row without an anchor', async () => {
    rows()[0].focus();
    keydown(rows()[0], 'ArrowDown', { shiftKey: true });
    await stable();
    expect(selectedIds()).toEqual([1, 2]);
    click(rows()[1]);
    await stable();
    click(rows()[3], { shiftKey: true });
    await stable();
    expect(selectedIds()).toEqual([2, 3, 4]);
  });

  it('ignores clicks on controls inside a row and rows that cannot be selected', async () => {
    host.selectable.set(() => false);
    await stable();
    click(rows()[0]);
    await stable();
    expect(host.clicks).toEqual([1]);
    expect(selectedIds()).toEqual([]);
    host.selectable.set((person) => person.id !== 1);
    await stable();
    click(rows()[1].querySelector('.city') as HTMLElement);
    await stable();
    expect(host.clicks).toEqual([1, 2]);
    expect(selectedIds()).toEqual([]);
    table.toggleRow(table.renderRows()[0]);
    expect(selectedIds()).toEqual([]);
    keydown(rows()[1], 'a', { ctrlKey: true });
    await stable();
    expect(selectedIds()).toEqual([2, 3, 4]);
  });

  it('selects radio rows once and leaves the selection alone with an own select-all state', async () => {
    host.mode.set('radio');
    await stable();
    table.selectRadio(table.renderRows()[1]);
    await stable();
    expect(selectedIds()).toEqual([2]);
    table.selectRadio(table.renderRows()[1]);
    host.selectable.set((person) => person.id !== 3);
    await stable();
    table.selectRadio(table.renderRows()[2]);
    expect(host.selects).toEqual([2]);

    host.mode.set('checkbox');
    host.selectAll.set(true);
    await stable();
    const all = root().querySelector('thead .tx-table__select input') as HTMLInputElement;
    expect(all.checked).toBe(true);
    all.click();
    await stable();
    expect(host.allChanges).toEqual([false]);
    expect(selectedIds()).toEqual([2]);

    host.selectAll.set(undefined);
    await stable();
    table.toggleAll(true);
    await stable();
    expect(selectedIds()).toEqual([1, 2, 4]);
  });

  it('compares rows by reference without a data key', async () => {
    host.dataKey.set(undefined);
    host.mode.set('checkbox');
    await stable();
    (root().querySelectorAll<HTMLInputElement>('tbody .tx-table__select input')[3]).click();
    await stable();
    expect(host.selection()).toEqual([PEOPLE[3]]);
    expect((rows()[3].querySelector('.tx-table__select input') as HTMLInputElement).checked).toBe(true);
  });

  it('adds sort fields without the meta key and drops a field after descending', async () => {
    host.sortMode.set('multiple');
    host.metaKey.set(false);
    await stable();
    sortBy('city');
    sortBy('age');
    await stable();
    expect(host.sortMeta()).toEqual([
      { field: 'city', order: 'asc' },
      { field: 'age', order: 'asc' },
    ]);
    expect(names()).toEqual(['Bohdan', 'Andrii', 'Olena', 'Iryna']);
    sortBy('city');
    await stable();
    expect(host.sortMeta()).toEqual([
      { field: 'city', order: 'desc' },
      { field: 'age', order: 'asc' },
    ]);
    sortBy('city');
    await stable();
    expect(host.sortMeta()).toEqual([{ field: 'age', order: 'asc' }]);
    expect(host.sorts.at(-1)).toEqual({ field: null, order: null, multiSortMeta: [{ field: 'age', order: 'asc' }] });
  });

  it('replaces the sort fields on a plain click with the meta key on', async () => {
    host.sortMode.set('multiple');
    await stable();
    sortBy('city');
    await stable();
    sortBy('age');
    await stable();
    expect(host.sortMeta()).toEqual([{ field: 'age', order: 'asc' }]);
  });

  it('sends the first sort field in lazy multiple mode and rewinds the local paginator on sort', async () => {
    host.sortMode.set('multiple');
    host.lazy.set(true);
    await stable();
    table.emitLazyLoad();
    expect(host.loads.at(-1)).toMatchObject({ sortField: null, sortOrder: null });
    sortBy('age');
    await stable();
    expect(host.loads.at(-1)).toMatchObject({ sortField: 'age', sortOrder: 'asc', multiSortMeta: [{ field: 'age', order: 'asc' }] });

    host.lazy.set(false);
    host.sortMode.set('single');
    host.paginator.set(true);
    host.first.set(2);
    await stable();
    sortBy('name');
    await stable();
    expect(host.first()).toBe(0);
    expect(names()).toEqual(['Andrii', 'Bohdan']);
  });

  it('does not sort a column that is not sortable or while a column is resized', async () => {
    table.sort({ field: 'city', sortable: false }, new MouseEvent('click'));
    table.resizing.set('name');
    table.sort(host.columns[0], new MouseEvent('click'));
    expect(host.sorts).toEqual([]);
  });

  it('opens an own context menu for a row with the mouse and the keyboard', async () => {
    host.menu.set([{ id: 'copy', label: 'Copy', icon: 'download' }]);
    await stable();
    rows()[1].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 0, clientY: 0 }));
    await stable();
    expect(host.menuRow()).toEqual(PEOPLE[1]);
    expect(host.menuSelects).toEqual([2]);
    expect([...document.querySelectorAll('.tx-menu__item .tx-table__menu-label')].map((label) => label.textContent)).toEqual(['Copy']);
    expect(document.querySelector('.tx-menu__item .tx-table__menu-icon')).toBeTruthy();
    expect(rows()[1].classList).toContain('tx-table__row--menu');

    const event = new KeyboardEvent('contextmenu', { bubbles: true, cancelable: true });
    rows()[2].dispatchEvent(event);
    await stable();
    expect(event.defaultPrevented).toBe(true);
    expect(host.menuSelects).toEqual([2, 3]);
  });

  it('keeps the browser menu with Shift, on inputs and without row actions', async () => {
    host.menu.set([{ id: 'copy', label: 'Copy' }]);
    await stable();
    const shifted = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, shiftKey: true });
    rows()[0].dispatchEvent(shifted);
    const onInput = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    rows()[0].querySelector('.note')?.dispatchEvent(onInput);
    host.menu.set([]);
    await stable();
    const noActions = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    rows()[0].dispatchEvent(noActions);
    host.rowMenu.set(false);
    await stable();
    const off = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    rows()[0].dispatchEvent(off);
    expect([shifted, onInput, noActions, off].map((item) => item.defaultPrevented)).toEqual([false, false, false, false]);
    expect(host.menuSelects).toEqual([]);
  });

  it('exports a single selected row, an empty selection and own export values', async () => {
    host.exportFn.set((person, column) => (column.field === 'age' ? person.age * 2 : resolveName(person, column)));
    host.selection.set(PEOPLE[2]);
    await stable();
    expect(table.exportCSV({ selectionOnly: true, filename: 'people' }).split('\r\n')).toEqual(['Name,City,Age', 'Iryna,Odesa,82']);
    host.selection.set(null);
    await stable();
    expect(table.exportCSV({ selectionOnly: true })).toBe('Name,City,Age');
  });
});

function resolveName(person: Person, column: TxTableColumn): unknown {
  return person[column.field as keyof Person];
}
