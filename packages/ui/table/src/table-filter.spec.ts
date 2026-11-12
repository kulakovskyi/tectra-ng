import { ChangeDetectionStrategy, Component, DebugElement, getDebugNode, signal } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { defaultMatchMode, filterRows, isFilled, isFilterActive, matchesFilter, matchesRule } from './table.filter';
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

  it('picks the default match mode of a column', () => {
    expect(defaultMatchMode({ field: 'tag', filterOptions: [{ label: 'Wood', value: 'wood' }] })).toBe('in');
    expect(defaultMatchMode({ field: 'price', filterType: 'numeric' })).toBe('equals');
    expect(defaultMatchMode({ field: 'name', filterMatchModes: ['contains', 'equals'] })).toBe('contains');
    expect(defaultMatchMode({ field: 'name' })).toBe('startsWith');
  });

  it('tells filled values and active filters apart', () => {
    expect(isFilled(null)).toBe(false);
    expect(isFilled('  ')).toBe(false);
    expect(isFilled([])).toBe(false);
    expect(isFilled([1])).toBe(true);
    expect(isFilled(0)).toBe(true);
    expect(isFilterActive(undefined)).toBe(false);
    expect(isFilterActive({ operator: 'and', rules: [{ value: '', matchMode: 'contains' }] })).toBe(false);
  });

  it('compares typed values with equals and not equals', () => {
    expect(matchesRule('12', { value: 12, matchMode: 'equals' })).toBe(true);
    expect(matchesRule(12, { value: 13, matchMode: 'notEquals' })).toBe(true);
    expect(matchesRule(false, { value: false, matchMode: 'notEquals' })).toBe(false);
    expect(matchesRule('2026-01-05T00:00:00', { value: new Date(2026, 0, 5), matchMode: 'equals' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 6), { value: new Date(2026, 0, 5), matchMode: 'notEquals' })).toBe(true);
    expect(matchesRule(null, { value: 'x', matchMode: 'contains' })).toBe(false);
    expect(matchesRule('x', { value: ['x'], matchMode: 'startsWith' })).toBe(true);
  });

  it('matches lists with null items and empty values', () => {
    expect(matchesRule(null, { value: [null], matchMode: 'in' })).toBe(true);
    expect(matchesRule(null, { value: ['wood'], matchMode: 'in' })).toBe(false);
    expect(matchesRule('Wood', { value: ['WOOD'], matchMode: 'in' })).toBe(true);
    expect(matchesRule('wood', { value: 'wood', matchMode: 'in' })).toBe(false);
  });

  it('compares numbers, text and dates in range rules', () => {
    expect(matchesRule(10, { value: 10, matchMode: 'gte' })).toBe(true);
    expect(matchesRule(9, { value: 10, matchMode: 'gte' })).toBe(false);
    expect(matchesRule('abc', { value: 5, matchMode: 'gt' })).toBe(false);
    expect(matchesRule('item 10', { value: 'item 9', matchMode: 'gt' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: '2026-02-01', matchMode: 'lt' })).toBe(true);
    expect(matchesRule(new Date(2026, 0, 5), { value: 'not a date', matchMode: 'gt' })).toBe(false);
    expect(matchesRule(5, { value: [null, 10], matchMode: 'between' })).toBe(true);
    expect(matchesRule(15, { value: [10, null], matchMode: 'between' })).toBe(true);
    expect(matchesRule(null, { value: [1, 10], matchMode: 'between' })).toBe(false);
    expect(matchesRule(5, { value: 'x', matchMode: 'between' })).toBe(true);
  });

  it('matches days and rejects missing or broken dates', () => {
    expect(matchesRule(new Date(2026, 0, 5), { value: new Date(2026, 0, 6), matchMode: 'dateIsNot' })).toBe(true);
    expect(matchesRule(null, { value: new Date(2026, 0, 6), matchMode: 'dateIs' })).toBe(false);
    expect(matchesRule('', { value: new Date(2026, 0, 6), matchMode: 'dateBefore' })).toBe(false);
    expect(matchesRule('broken', { value: new Date(2026, 0, 6), matchMode: 'dateAfter' })).toBe(false);
    expect(matchesRule(Date.UTC(2026, 0, 7), { value: new Date(2026, 0, 1), matchMode: 'dateAfter' })).toBe(true);
  });

  it('passes every value through a filter without filled rules', () => {
    expect(matchesFilter('x', { operator: 'and', rules: [{ value: null, matchMode: 'equals' }] })).toBe(true);
    expect(matchesFilter(5, { operator: 'and', rules: [{ value: 1, matchMode: 'gt' }, { value: 10, matchMode: 'lt' }] })).toBe(true);
    const columns: TxTableColumn[] = [{ field: 'label', filterField: 'name' }];
    expect(filterRows(ITEMS, { label: { operator: 'and', rules: [{ value: 'lamp', matchMode: 'equals' }] } }, columns, '', ['name']).map((item) => item.id)).toEqual([3]);
    expect(filterRows(ITEMS, { label: { operator: 'and', rules: [{ value: 'lamp', matchMode: 'equals' }] } }, columns, 'chair', ['name'])).toEqual([]);
    expect(filterRows([{ name: null }], {}, columns, 'x', ['name'])).toEqual([]);
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

describe('TxTableColumnFilter', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const ids = () => [...root().querySelectorAll('tbody .tx-table__row')].map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
  const panel = () => document.querySelector('.tx-table-filter') as HTMLElement;
  const button = (label: string) => [...panel().querySelectorAll<HTMLButtonElement>('button')].find((item) => item.textContent?.includes(label)) as HTMLButtonElement;
  const emit = (element: Element | null, value: unknown) => (getDebugNode(element) as DebugElement | null)?.triggerEventHandler('ngModelChange', value);
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();
  };
  const openFilter = async (field: string) => {
    (root().querySelector(`th[data-field="${field}"] .tx-table-filter__button`) as HTMLElement).click();
    await stable();
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

  it('builds a numeric filter with two rules, an operator and a removed rule', async () => {
    await openFilter('price');
    emit(panel().querySelector('tx-input-number'), 100);
    emit(panel().querySelector('.tx-table-filter__rule tx-select'), 'gt');
    button('Add rule').click();
    await stable();
    expect(button('Add rule')).toBeUndefined();
    emit(panel().querySelectorAll('.tx-table-filter__rule')[1].querySelector('tx-input-number'), 20);
    emit(panel().querySelectorAll('.tx-table-filter__rule')[1].querySelector('tx-select'), 'lt');
    emit(panel().querySelector(':scope > tx-select'), 'or');
    await stable();
    button('Apply').click();
    await stable();
    expect(host.filters()['price']).toEqual({
      operator: 'or',
      rules: [
        { value: 100, matchMode: 'gt' },
        { value: 20, matchMode: 'lt' },
      ],
    });
    expect(ids()).toEqual(['Café table', 'Shelf']);

    await openFilter('price');
    expect(panel().querySelectorAll('.tx-table-filter__rule')).toHaveLength(2);
    button('Remove rule').click();
    await stable();
    expect(panel().querySelectorAll('.tx-table-filter__rule')).toHaveLength(1);
    button('Apply').click();
    await stable();
    expect(host.filters()['price'].rules).toEqual([{ value: 20, matchMode: 'lt' }]);
    expect(ids()).toEqual([]);

    await openFilter('price');
    button('Clear').click();
    await stable();
    expect(host.filters()).toEqual({});
    expect(ids()).toHaveLength(4);
  });

  it('applies a text filter with Enter', async () => {
    await openFilter('name');
    const input = panel().querySelector('input[type="text"]') as HTMLInputElement;
    input.value = 'sh';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await stable();
    expect(ids()).toEqual(['Shelf']);
  });

  it('picks options and yes / no values', async () => {
    await openFilter('tag');
    expect(panel().querySelector('.tx-table-filter__rule')).toBeNull();
    emit(panel().querySelector('tx-multiselect'), ['wood']);
    button('Apply').click();
    await stable();
    expect(ids()).toEqual(['Café table', 'Shelf']);

    await openFilter('active');
    emit(panel().querySelector('tx-select'), false);
    await stable();
    expect(host.filters()['active'].rules[0]).toEqual({ value: false, matchMode: 'equals' });
    expect(ids()).toEqual([]);
  });

  it('applies row filters at once for numbers and options and switches the match mode from its menu', async () => {
    host.display.set('row');
    host.filters.set({ price: { operator: 'and', rules: [{ value: 0, matchMode: 'gt' }, { value: 500, matchMode: 'lt' }] } });
    await stable();
    const row = root().querySelector('.tx-table__filter-row') as HTMLElement;
    emit(row.querySelector('tx-input-number'), 100);
    await stable();
    expect(host.filters()['price'].rules).toEqual([
      { value: 100, matchMode: 'gt' },
      { value: 500, matchMode: 'lt' },
    ]);
    expect(ids()).toEqual(['Café table', 'Shelf']);
    emit(row.querySelector('tx-multiselect'), ['glass']);
    await stable();
    expect(ids()).toEqual([]);
    emit(row.querySelector('tx-multiselect'), []);
    await stable();

    (row.querySelectorAll('td')[1].querySelector('.tx-table-filter__button') as HTMLElement).click();
    await stable();
    const items = [...document.querySelectorAll<HTMLElement>('.tx-menu__item')];
    expect(items.map((item) => item.textContent?.trim())).toContain('Less than');
    items.find((item) => item.textContent?.trim() === 'Less than')?.click();
    await stable();
    expect(host.filters()['price'].rules).toEqual([
      { value: 100, matchMode: 'lt' },
      { value: 500, matchMode: 'lt' },
    ]);
    expect(ids()).toEqual(['Chair', 'Lamp']);
  });
});

describe('TxTable filter editors before their code loads', () => {
  it('holds the place of the number, options and date editors with a read-only input of the same size', async () => {
    TestBed.configureTestingModule({ deferBlockBehavior: DeferBlockBehavior.Manual });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.display.set('row');
    fixture.detectChanges();
    await fixture.whenStable();
    const row = () => fixture.nativeElement.querySelector('.tx-table__filter-row') as HTMLElement;
    const pending = () => [...row().querySelectorAll<HTMLInputElement>('input.tx-table-filter__value[readonly]')];

    expect(pending()).toHaveLength(3);
    expect(pending().every((input) => input.getAttribute('aria-hidden') === 'true' && input.tabIndex === -1)).toBe(true);
    expect(row().querySelector('tx-datepicker, tx-input-number, tx-multiselect')).toBeNull();

    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    fixture.detectChanges();
    expect(pending()).toHaveLength(0);
    expect(row().querySelectorAll('tx-datepicker, tx-input-number, tx-multiselect')).toHaveLength(3);
    fixture.destroy();
  });
});
