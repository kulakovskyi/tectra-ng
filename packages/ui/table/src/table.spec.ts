import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TxTableActions } from './table-actions.component';
import { TxTable } from './table.component';
import { TxTableAction, TxTableActionsTemplate, TxTableCell, TxTableEmpty, TxTableExpansion } from './table.templates';
import { TxSortMeta, TxSortOrder, TxTableColumn, TxTableLazyLoadEvent, TxTableSelectionMode, TxTableSortEvent } from './table.types';
import { actionIdOf, columnLabel, compareValues, mergeColumnOrder, nextSortOrder, pxOf, resolveField, rowKeyOf, sortRows, writeField } from './table.utils';

interface Person {
  id: number;
  name: string;
  city: string;
  age: number;
  team: { name: string };
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Olena', city: 'Lviv', age: 34, team: { name: 'Design' } },
  { id: 2, name: 'Andrii', city: 'Kyiv', age: 28, team: { name: 'Backend' } },
  { id: 3, name: 'Iryna', city: 'Odesa', age: 41, team: { name: 'Design' } },
  { id: 4, name: 'Bohdan', city: 'Kyiv', age: 23, team: { name: 'Frontend' } },
  { id: 5, name: 'Marta', city: 'Dnipro', age: 37, team: { name: 'Backend' } },
];

@Component({
  imports: [TxTable, TxTableCell, TxTableEmpty, TxTableExpansion, TxTableActionsTemplate, TxTableActions, TxTableAction],
  template: `
    <tx-table
      ariaLabel="People"
      dataKey="id"
      [value]="rows()"
      [(columns)]="columns"
      [(sortField)]="sortField"
      [(sortOrder)]="sortOrder"
      [(multiSortMeta)]="multiSortMeta"
      [sortMode]="sortMode()"
      [paginator]="paginator()"
      [(first)]="first"
      [(rows)]="pageSize"
      [lazy]="lazy()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [caption]="caption()"
      [selectionMode]="selectionMode()"
      [(selection)]="selection"
      [(expandedRowKeys)]="expanded"
      [resizableColumns]="true"
      [reorderableColumns]="true"
      [columnSettings]="true"
      [stateKey]="stateKey()"
      [stripedRows]="striped()"
      [size]="size()"
      [dt]="{ headerCell: { background: 'red' } }"
      [pt]="{ table: { class: 'own-table' } }"
      (sortChange)="sorts.push($event)"
      (lazyLoad)="loads.push($event)"
      (selectAllChange)="selectAll.push($event)"
    >
      <span txTableToolbar class="toolbar-content">Filters</span>
      <ng-template txTableCell="name" let-person>
        <strong class="name">{{ person.name }}</strong>
      </ng-template>
      <ng-template txTableCell="team.name" let-value="value">
        <em>{{ value }}</em>
      </ng-template>
      <ng-template txTableExpansion let-person>
        <p class="details">Details of {{ person.name }}</p>
      </ng-template>
      <ng-template txTableActions let-person>
        <tx-table-actions>
          <button *txTableAction="{ label: 'Edit' }" class="edit" type="button" (click)="edited.push(person.id)">Edit</button>
          <button *txTableAction="{ label: 'Delete' }" class="delete" type="button" (click)="deleted.push(person.id)">Delete</button>
        </tx-table-actions>
      </ng-template>
      <ng-template txTableEmpty>
        <span class="own-empty">Nobody here</span>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly rows = signal<Person[]>(PEOPLE);
  columns: TxTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'city', header: 'City' },
    { field: 'age', header: 'Age', align: 'end' },
    { field: 'team.name', header: 'Team', sortable: false },
  ];
  readonly sortField = signal<string | null>(null);
  readonly sortOrder = signal<TxSortOrder>(null);
  readonly multiSortMeta = signal<TxSortMeta[]>([]);
  readonly sortMode = signal<'single' | 'multiple'>('single');
  readonly paginator = signal(false);
  readonly first = signal(0);
  readonly pageSize = signal(2);
  readonly lazy = signal(false);
  readonly totalRecords = signal<number | undefined>(undefined);
  readonly loading = signal(false);
  readonly caption = signal<string | undefined>(undefined);
  readonly selectionMode = signal<TxTableSelectionMode | undefined>(undefined);
  readonly selection = signal<Person | Person[] | null>(null);
  readonly expanded = signal<unknown[]>([]);
  readonly stateKey = signal<string | undefined>(undefined);
  readonly striped = signal(false);
  readonly size = signal<'small' | 'medium' | 'large'>('medium');
  readonly sorts: TxTableSortEvent[] = [];
  readonly loads: TxTableLazyLoadEvent[] = [];
  readonly selectAll: boolean[] = [];
  readonly edited: number[] = [];
  readonly deleted: number[] = [];
}

describe('table utils', () => {
  it('reads nested fields and compares values', () => {
    expect(resolveField({ a: { b: 3 } }, 'a.b')).toBe(3);
    expect(resolveField(null, 'a')).toBeUndefined();
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(compareValues(null, 1)).toBe(1);
    expect(nextSortOrder(null)).toBe('asc');
    expect(nextSortOrder('asc')).toBe('desc');
    expect(nextSortOrder('desc')).toBeNull();
  });

  it('sorts by several fields and keeps empty values last', () => {
    const rows = [
      { city: 'Kyiv', age: 30 },
      { city: null, age: 20 },
      { city: 'Kyiv', age: 25 },
      { city: 'Lviv', age: 40 },
    ];
    expect(sortRows(rows, [{ field: 'city', order: 'desc' }, { field: 'age', order: 'asc' }]).map((row) => row.age)).toEqual([40, 25, 30, 20]);
  });

  it('builds action ids and merges a saved column order with new columns', () => {
    expect(actionIdOf({ label: 'Send report!' })).toBe('send-report');
    expect(actionIdOf({ label: 'x', id: 'own' })).toBe('own');
    const columns = [{ field: 'a' }, { field: 'new' }, { field: 'b' }, { field: 'c' }];
    expect(mergeColumnOrder(columns, ['c', 'a', 'b'], () => true).map((column) => column.field)).toEqual(['c', 'a', 'new', 'b']);
  });

  it('writes nested fields and skips missing parents', () => {
    const row = { a: { b: 1 }, c: null as unknown, d: 'text' };
    writeField(row, 'a.b', 2);
    writeField(row, 'c.x', 3);
    writeField(row, 'd.length', 4);
    writeField(row, 'missing.deep.value', 5);
    writeField(row, '', 6);
    expect(row).toEqual({ a: { b: 2 }, c: null, d: 'text' });
    expect(resolveField({ a: null }, 'a.b')).toBeUndefined();
    expect(resolveField({ a: 1 }, undefined)).toBeUndefined();
  });

  it('compares dates, booleans, numbers and empty values', () => {
    expect(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBeGreaterThan(0);
    expect(compareValues(true, false)).toBe(1);
    expect(compareValues(3, 5)).toBe(-2);
    expect(compareValues(1, '')).toBe(-1);
    expect(compareValues(undefined, 'a')).toBe(1);
    expect(compareValues('a', 'a')).toBe(0);
  });

  it('keeps the order of equal rows and copies rows without sort meta', () => {
    const rows = [
      { id: 1, city: 'Kyiv' },
      { id: 2, city: 'Kyiv' },
    ];
    expect(sortRows(rows, [{ field: 'city', order: 'desc' }]).map((row) => row.id)).toEqual([1, 2]);
    const copy = sortRows(rows, []);
    expect(copy).toEqual(rows);
    expect(copy).not.toBe(rows);
  });

  it('builds row keys from a data key, the row itself or the index', () => {
    expect(rowKeyOf({ id: 7 }, 'id', 0)).toBe(7);
    expect(rowKeyOf({ name: 'x' }, 'id', 3)).toBe(3);
    const row = { name: 'y' };
    expect(rowKeyOf(row, undefined, 1)).toBe(row);
    expect(rowKeyOf(null, undefined, 4)).toBe(4);
  });

  it('reads pixel lengths and column labels', () => {
    expect(pxOf('120px')).toBe(120);
    expect(pxOf(' -4.5px ')).toBe(-4.5);
    expect(pxOf('10rem')).toBeNull();
    expect(pxOf(undefined)).toBeNull();
    expect(columnLabel({ field: 'city' })).toBe('city');
    expect(columnLabel({ field: 'city', header: 'City' })).toBe('City');
  });

  it('puts new columns before the next visible saved column or at the end', () => {
    const columns = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }];
    expect(mergeColumnOrder(columns, ['c', 'missing', 'a'], (field) => field !== 'c').map((column) => column.field)).toEqual(['c', 'a', 'b', 'd']);
  });
});

describe('TxTable', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const narrow = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const el = (selector: string) => root().querySelector(selector) as HTMLElement;
  const all = (selector: string) => [...root().querySelectorAll<HTMLElement>(selector)];
  const names = () => all('tbody .tx-table__row').map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
  const headers = () => all('thead th').map((th) => th.getAttribute('data-field'));
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow } }] });
    narrow.next({ matches: false, breakpoints: {} });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('renders a hidden caption only when one is given', async () => {
    expect(el('caption')).toBeNull();
    host.caption.set('People of the design team');
    await stable();
    expect(el('caption').textContent?.trim()).toBe('People of the design team');
    expect(el('caption').classList).toContain('tx-table__sr-only');
    expect(el('table').firstElementChild?.tagName).toBe('CAPTION');
  });

  it('renders headers, rows, cell templates and nested values', () => {
    expect(el('table').getAttribute('aria-label')).toBe('People');
    expect(headers()).toEqual(['__expand', 'name', 'city', 'age', 'team.name', '__actions']);
    expect(names()).toEqual(['Olena', 'Andrii', 'Iryna', 'Bohdan', 'Marta']);
    expect(el('tbody [data-field="city"]').textContent?.trim()).toBe('Lviv');
    expect(el('tbody [data-field="team.name"] em').textContent).toBe('Design');
    expect(el('th[data-field="age"]').getAttribute('data-align')).toBe('end');
    expect(el('.toolbar-content').textContent).toBe('Filters');
    expect(root().classList).toContain('tx-table--gridlines');
    expect(root().classList).toContain('tx-table--hoverable');
  });

  it('sorts asc, desc and back to the original order', async () => {
    const sortName = el('th[data-field="name"] .tx-table__sort');
    expect(el('th[data-field="name"]').getAttribute('aria-sort')).toBe('none');
    expect(el('th[data-field="team.name"] .tx-table__sort')).toBeNull();
    sortName.click();
    await stable();
    expect(names()).toEqual(['Andrii', 'Bohdan', 'Iryna', 'Marta', 'Olena']);
    expect(el('th[data-field="name"]').getAttribute('aria-sort')).toBe('ascending');
    expect(host.sortField()).toBe('name');
    sortName.click();
    await stable();
    expect(names()).toEqual(['Olena', 'Marta', 'Iryna', 'Bohdan', 'Andrii']);
    expect(el('.tx-table__sort-icon--desc')).toBeTruthy();
    sortName.click();
    await stable();
    expect(names()).toEqual(['Olena', 'Andrii', 'Iryna', 'Bohdan', 'Marta']);
    expect(host.sorts.map((event) => event.order)).toEqual(['asc', 'desc', null]);
  });

  it('sorts by several columns with the meta key', async () => {
    host.sortMode.set('multiple');
    await stable();
    el('th[data-field="city"] .tx-table__sort').click();
    await stable();
    el('th[data-field="age"] .tx-table__sort').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await stable();
    expect(host.multiSortMeta()).toEqual([
      { field: 'city', order: 'asc' },
      { field: 'age', order: 'asc' },
    ]);
    expect(names()).toEqual(['Marta', 'Bohdan', 'Andrii', 'Olena', 'Iryna']);
    expect(all('.tx-table__sort-badge').map((badge) => badge.textContent)).toEqual(['1', '2']);
  });

  it('pages the rows locally with the built-in paginator', async () => {
    host.paginator.set(true);
    await stable();
    expect(names()).toEqual(['Olena', 'Andrii']);
    root().querySelector<HTMLElement>('.tx-paginator__next')?.click();
    await stable();
    expect(host.first()).toBe(2);
    expect(names()).toEqual(['Iryna', 'Bohdan']);
  });

  it('asks the server for pages and sorting in lazy mode', async () => {
    host.lazy.set(true);
    host.paginator.set(true);
    host.totalRecords.set(40);
    host.rows.set(PEOPLE.slice(0, 2));
    await stable();
    root().querySelector<HTMLElement>('.tx-paginator__next')?.click();
    await stable();
    el('th[data-field="age"] .tx-table__sort').click();
    await stable();
    expect(host.loads).toEqual([
      { first: 2, rows: 2, sortField: null, sortOrder: null, multiSortMeta: [], filters: {}, globalFilter: '' },
      { first: 2, rows: 2, sortField: 'age', sortOrder: 'asc', multiSortMeta: [{ field: 'age', order: 'asc' }], filters: {}, globalFilter: '' },
    ]);
    expect(names()).toEqual(['Olena', 'Andrii']);
  });

  it('selects rows with checkboxes and the select-all checkbox', async () => {
    host.selectionMode.set('checkbox');
    await stable();
    expect(headers()[0]).toBe('__select');
    const boxes = () => all('tbody .tx-table__select input');
    boxes()[1].click();
    await stable();
    expect((host.selection() as Person[]).map((person) => person.id)).toEqual([2]);
    expect(all('tbody .tx-table__row')[1].classList).toContain('tx-table__row--selected');
    el('thead .tx-table__select input').click();
    await stable();
    expect((host.selection() as Person[]).map((person) => person.id).sort()).toEqual([1, 2, 3, 4, 5]);
    expect(host.selectAll).toEqual([true]);
    el('thead .tx-table__select input').click();
    await stable();
    expect(host.selection()).toEqual([]);
  });

  it('selects a single row with a radio button', async () => {
    host.selectionMode.set('radio');
    await stable();
    all('tbody .tx-table__select input')[2].click();
    await stable();
    expect((host.selection() as Person).id).toBe(3);
  });

  it('selects rows by click and keyboard in multiple mode', async () => {
    host.selectionMode.set('multiple');
    await stable();
    const rows = () => all('tbody .tx-table__row');
    expect(el('table').getAttribute('role')).toBe('grid');
    rows()[0].click();
    await stable();
    rows()[2].dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await stable();
    expect((host.selection() as Person[]).map((person) => person.id)).toEqual([1, 3]);
    rows()[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await stable();
    expect((host.selection() as Person[]).map((person) => person.id)).toEqual([2]);
    rows()[1].focus();
    rows()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await stable();
    expect(document.activeElement).toBe(rows()[2]);
    rows()[2].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await stable();
    expect((host.selection() as Person[]).map((person) => person.id)).toEqual([2, 3]);
  });

  it('expands a row with the toggle button', async () => {
    const toggle = () => all('tbody .tx-table__row-toggle')[1];
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    toggle().click();
    await stable();
    expect(host.expanded()).toEqual([2]);
    expect(el('.details').textContent).toBe('Details of Andrii');
    expect(el('.tx-table__expansion-cell').getAttribute('colspan')).toBe('6');
    toggle().click();
    await stable();
    expect(el('.tx-table__expansion-body').classList).not.toContain('tx-table__expansion-body--open');
    await new Promise((resolve) => setTimeout(resolve, 450));
    await stable();
    expect(el('.details')).toBeNull();
  });

  it('hides columns from the settings, reorders and resizes them, and saves the state', async () => {
    host.stateKey.set('people');
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Person>;
    table.toggleColumn('city', false);
    await stable();
    expect(headers()).not.toContain('city');
    expect(el('tbody [data-field="city"]')).toBeNull();

    const age = el('th[data-field="age"] .tx-table__sort');
    age.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    await stable();
    expect(headers().slice(1, 4)).toEqual(['age', 'name', 'team.name']);
    expect(host.columns.map((column) => column.field)).toEqual(['age', 'name', 'city', 'team.name']);

    const resizer = el('th[data-field="age"] .tx-table__resizer');
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await stable();
    const saved = JSON.parse(localStorage.getItem('people') ?? '{}');
    expect(saved.hidden).toEqual(['city']);
    expect(saved.order).toEqual(['age', 'name', 'city', 'team.name']);
    expect(saved.widths.age).toBeGreaterThan(0);
  });

  it('restores the saved state', async () => {
    fixture.destroy();
    localStorage.setItem('restored', JSON.stringify({ hidden: ['age'], order: ['city', 'name'], sortField: 'city', sortOrder: 'desc', widths: { city: 180 } }));
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    host.stateKey.set('restored');
    fixture.autoDetectChanges();
    await stable();
    expect(headers()).toEqual(['__expand', 'city', 'name', 'team.name', '__actions']);
    expect(host.sortField()).toBe('city');
    expect(names()[0]).toBe('Iryna');
    expect(el('th[data-field="city"]').style.width).toBe('180px');
  });

  it('renders row actions and opens them as a context menu', async () => {
    const firstRow = all('tbody .tx-table__row')[0];
    expect(firstRow.querySelector('.tx-table-actions__more')).toBeTruthy();
    firstRow.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20 }));
    await stable();
    const items = [...document.querySelectorAll<HTMLElement>('.tx-menu__item')];
    expect(items.map((item) => item.querySelector('.tx-table__menu-label')?.textContent)).toEqual(['Edit', 'Delete']);
    expect(firstRow.classList).toContain('tx-table__row--menu');
    items[1].click();
    await stable();
    expect(host.deleted).toEqual([1]);
  });

  it('shows the empty template and the loading overlay', async () => {
    host.loading.set(true);
    host.rows.set([]);
    await stable();
    expect(el('.own-empty').textContent).toBe('Nobody here');
    expect(el('.tx-table__frame').getAttribute('aria-busy')).toBe('true');
    expect(el('.tx-table__loading tx-progress-spinner')).toBeTruthy();
  });

  it('turns rows into cards below the breakpoint', async () => {
    host.selectionMode.set('checkbox');
    narrow.next({ matches: true, breakpoints: {} });
    await stable();
    expect(root().classList).toContain('tx-table--cards');
    expect(el('table')).toBeNull();
    const card = all('.tx-table__card')[0];
    expect(card.querySelector('.tx-table__card-title')?.textContent?.trim()).toBe('Olena');
    expect([...card.querySelectorAll('.tx-table__card-label')].map((label) => label.textContent)).toEqual(['City', 'Age', 'Team']);
    expect(card.querySelector('.tx-table__card-actions .edit')).toBeTruthy();
    expect(card.querySelector('.tx-table-actions__more')).toBeNull();
    expect(el('.tx-table__select-all')).toBeTruthy();
  });

  it('applies striped rows, sizes, dt and pt', async () => {
    host.striped.set(true);
    host.size.set('small');
    await stable();
    expect(root().classList).toContain('tx-table--striped');
    expect(root().getAttribute('data-size')).toBe('small');
    expect(all('tbody .tx-table__row')[1].classList).toContain('tx-table__row--odd');
    expect(root().style.getPropertyValue('--tx-table-header-cell-background')).toBe('red');
    expect(el('table').classList).toContain('own-table');
  });
});
