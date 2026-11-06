import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { filterRows, matchesFilter, matchesRule } from './table.filter';
import { TxTableColumn, TxTableFilterDisplay, TxTableFilterEvent, TxTableFilters, TxTableLazyLoadEvent } from './table.types';

interface Item {
  id: number;
  name: string;
  price: number;
  added: Date;
  active: boolean;
  tag: string;
}

const ITEMS: Item[] = [
  { id: 1, name: 'Café table', price: 120, added: new Date(2026, 0, 5), active: true, tag: 'wood' },
  { id: 2, name: 'Chair', price: 45, added: new Date(2026, 1, 10), active: false, tag: 'metal' },
  { id: 3, name: 'Lamp', price: 30, added: new Date(2026, 2, 15), active: true, tag: 'glass' },
  { id: 4, name: 'Shelf', price: 210, added: new Date(2026, 3, 20), active: true, tag: 'wood' },
];

describe('table filters', () => {
  it('matches text rules ignoring case and accents', () => {
    expect(matchesRule('Café', { value: 'cafe', matchMode: 'equals' })).toBe(true);
    expect(matchesRule('Café table', { value: 'TAB', matchMode: 'contains' })).toBe(true);
    expect(matchesRule('Café table', { value: 'caf', matchMode: 'startsWith' })).toBe(true);
    expect(matchesRule('Café table', { value: 'ble', matchMode: 'endsWith' })).toBe(true);
    expect(matchesRule('Lamp', { value: 'x', matchMode: 'notContains' })).toBe(true);
    expect(matchesRule('Lamp', { value: 'lamp', matchMode: 'notEquals' })).toBe(false);
    expect(matchesRule('Lamp', { value: '', matchMode: 'equals' })).toBe(true);
  });

  it('matches numbers, dates, lists and ranges', () => {
    expect(matchesRule(30, { value: 45, matchMode: 'lt' })).toBe(true);
    expect(matchesRule(45, { value: 45, matchMode: 'lte' })).toBe(true);
    expect(matchesRule(210, { value: 200, matchMode: 'gt' })).toBe(true);
    expect(matchesRule(null, { value: 1, matchMode: 'gt' })).toBe(false);
    expect(matchesRule(45, { value: [40, 50], matchMode: 'between' })).toBe(true);
    expect(matchesRule('wood', { value: ['wood', 'glass'], matchMode: 'in' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5, 14), { value: new Date(2026, 0, 5), matchMode: 'dateIs' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 1, 1), matchMode: 'dateBefore' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 1, 1), matchMode: 'dateAfter' })).toBe(false);
    expect(matchesRule(true, { value: true, matchMode: 'equals' })).toBe(true);
  });

  it('combines rules with and / or and filters rows with a global search', () => {
    const cheapOrWood = { operator: 'or' as const, rules: [{ value: 40, matchMode: 'lt' as const }, { value: 200, matchMode: 'gt' as const }] };
    expect(matchesFilter(30, cheapOrWood)).toBe(true);
    expect(matchesFilter(120, cheapOrWood)).toBe(false);
    const columns: TxTableColumn[] = [{ field: 'name' }, { field: 'tag' }];
    expect(filterRows(ITEMS, { price: cheapOrWood }, columns, '', ['name']).map((item) => item.id)).toEqual([3, 4]);
    expect(filterRows(ITEMS, {}, columns, 'WOOD', ['name', 'tag']).map((item) => item.id)).toEqual([1, 4]);
  });
});

@Component({
  imports: [TxTable],
  template: `
    <tx-table
      ariaLabel="Items"
      dataKey="id"
      [value]="items"
      [columns]="columns"
      [filterDisplay]="display()"
      [filterDelay]="0"
      [lazy]="lazy()"
      [(filters)]="filters"
      [(globalFilter)]="search"
      (filterChange)="events.push($event)"
      (lazyLoad)="loads.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = ITEMS;
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Name', filter: true },
    { field: 'price', header: 'Price', filter: true, filterType: 'numeric' },
    { field: 'tag', header: 'Tag', filter: true, filterOptions: [{ label: 'Wood', value: 'wood' }, { label: 'Glass', value: 'glass' }] },
    { field: 'active', header: 'Active', filter: true, filterType: 'boolean' },
    { field: 'added', header: 'Added', filter: true, filterType: 'date' },
  ];
  readonly display = signal<TxTableFilterDisplay>('menu');
  readonly lazy = signal(false);
  readonly filters = signal<TxTableFilters>({});
  readonly search = signal('');
  readonly events: TxTableFilterEvent[] = [];
  readonly loads: TxTableLazyLoadEvent[] = [];
}

describe('TxTable filters', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const ids = () => [...root().querySelectorAll('tbody .tx-table__row')].map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('shows a filter button per filterable column and applies a menu filter', async () => {
    const buttons = [...root().querySelectorAll<HTMLElement>('.tx-table-filter__button')];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['Filter Name', 'Filter Price', 'Filter Tag', 'Filter Active', 'Filter Added']);
    buttons[1].click();
    await stable();
    const panel = document.querySelector('.tx-table-filter') as HTMLElement;
    expect(panel).toBeTruthy();
    const addRule = [...panel.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Add rule'));
    addRule?.click();
    await stable();
    expect(document.querySelectorAll('.tx-table-filter__rule')).toHaveLength(2);
    expect(document.querySelector('.tx-table-filter tx-select')).toBeTruthy();
    host.filters.set({ price: { operator: 'or', rules: [{ value: 40, matchMode: 'lt' }, { value: 200, matchMode: 'gt' }] } });
    await stable();
    expect(ids()).toEqual(['Lamp', 'Shelf']);
    expect(buttons[1].getAttribute('class')).toContain('tx-table-filter__button--active');
  });

  it('filters by the global search and reports the filtered rows', async () => {
    host.search.set('chair');
    await stable();
    expect(ids()).toEqual(['Chair']);
    expect(host.events.at(-1)?.filteredValue.map((item) => (item as Item).id)).toEqual([2]);
  });

  it('types into the filter row and picks a match mode from its menu', async () => {
    host.display.set('row');
    await stable();
    const row = root().querySelector('.tx-table__filter-row') as HTMLElement;
    expect(row).toBeTruthy();
    const input = row.querySelector<HTMLInputElement>('input[type="text"]') as HTMLInputElement;
    input.value = 'la';
    input.dispatchEvent(new Event('input'));
    await stable();
    expect(ids()).toEqual(['Lamp']);
    expect(host.filters()['name'].rules[0]).toEqual({ value: 'la', matchMode: 'startsWith' });
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable;
    table.applyFilter('name', { operator: 'and', rules: [{ value: 'a', matchMode: 'contains' }] });
    await stable();
    expect(ids()).toEqual(['Café table', 'Chair', 'Lamp']);
    table.clearFilters();
    await stable();
    expect(ids()).toHaveLength(4);
  });

  it('filters dates with the date picker in the filter row', async () => {
    host.display.set('row');
    await stable();
    const picker = root().querySelector('.tx-table__filter-row [data-field="added"] tx-datepicker, .tx-table__filter-row tx-datepicker') as HTMLElement;
    expect(picker).toBeTruthy();
    const input = picker.querySelector('input') as HTMLInputElement;
    input.value = '03/15/2026';
    input.dispatchEvent(new Event('input'));
    await stable();
    expect(ids()).toEqual(['Lamp']);
    expect(host.filters()['added'].rules[0]).toEqual({ value: new Date(2026, 2, 15), matchMode: 'dateIs' });
  });

  it('sends filters to the server in lazy mode', async () => {
    host.lazy.set(true);
    await stable();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable;
    table.applyFilter('tag', { operator: 'and', rules: [{ value: ['wood'], matchMode: 'in' }] });
    await stable();
    expect(host.loads.at(-1)?.filters).toEqual({ tag: { operator: 'and', rules: [{ value: ['wood'], matchMode: 'in' }] } });
    expect(ids()).toHaveLength(4);
  });
});
