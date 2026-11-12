import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TxTableActions } from './table-actions.component';
import { TxTable } from './table.component';
import { TxTableAction, TxTableActionsTemplate, TxTableExpansion, TxTableFooterCell, TxTableHeaderCell } from './table.templates';
import { TxTableColumn, TxTableColumnReorderEvent, TxTableColumnResizeEvent, TxTableColumnResizeMode, TxTableFilterEvent, TxTableLazyLoadEvent, TxTableStateStorage } from './table.types';

interface City {
  id: number;
  name: string;
  country: string | null;
  people: number;
  area: number;
}

const CITIES: City[] = [
  { id: 1, name: 'Lviv', country: 'UA', people: 720, area: 182 },
  { id: 2, name: 'Kyiv', country: 'UA', people: 2950, area: 839 },
  { id: 3, name: 'Gdansk', country: null, people: 470, area: 262 },
  { id: 4, name: 'Odesa', country: 'UA', people: 1010, area: 236 },
];

const COLUMNS: TxTableColumn[] = [
  { field: 'name', header: 'Name', frozen: 'start', minWidth: '80px', maxWidth: '200px' },
  { field: 'country', header: 'Country', sortable: false, initialWidth: '120px' },
  { field: 'people', header: 'People', footer: 'Total' },
  { field: 'area', header: 'Area', reorderable: false, editable: true },
];

@Component({
  imports: [TxTable, TxTableExpansion, TxTableHeaderCell, TxTableFooterCell, TxTableActionsTemplate, TxTableActions, TxTableAction],
  template: `
    <tx-table
      ariaLabel="Cities"
      dataKey="id"
      [value]="value()"
      [(columns)]="columns"
      [resizableColumns]="true"
      [columnResizeMode]="resizeMode()"
      [reorderableColumns]="reorderable()"
      [reorderableRows]="true"
      selectionMode="checkbox"
      editMode="row"
      [actionsFrozen]="actionsFrozen()"
      [stateKey]="stateKey()"
      [stateStorage]="storage()"
      [breakpoint]="breakpoint()"
      [paginator]="paginator()"
      [(first)]="first"
      [rows]="2"
      [lazy]="lazy()"
      [filterDelay]="0"
      [(globalFilter)]="search"
      [frozenValue]="pinned()"
      (columnResize)="resizes.push($event)"
      (columnReorder)="reorders.push($event)"
      (filterChange)="filterEvents.push($event)"
      (lazyLoad)="loads.push($event)"
    >
      <ng-template txTableHeaderCell="people"><span class="own-header">Population</span></ng-template>
      <ng-template txTableFooterCell="area"><span class="own-footer">km²</span></ng-template>
      <ng-template txTableExpansion let-city><p class="details">{{ city.name }}</p></ng-template>
      <ng-template txTableActions>
        <tx-table-actions><button *txTableAction="{ label: 'Open' }" type="button">Open</button></tx-table-actions>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal<City[] | null>(CITIES);
  columns: TxTableColumn[] = COLUMNS.map((column) => ({ ...column }));
  readonly resizeMode = signal<TxTableColumnResizeMode>('expand');
  readonly reorderable = signal(true);
  readonly actionsFrozen = signal(true);
  readonly stateKey = signal<string | undefined>(undefined);
  readonly storage = signal<TxTableStateStorage>('local');
  readonly breakpoint = signal('64rem');
  readonly paginator = signal(false);
  readonly first = signal(0);
  readonly lazy = signal(false);
  readonly search = signal('');
  readonly pinned = signal<City[] | undefined>(undefined);
  readonly resizes: TxTableColumnResizeEvent[] = [];
  readonly reorders: TxTableColumnReorderEvent[] = [];
  readonly filterEvents: TxTableFilterEvent[] = [];
  readonly loads: TxTableLazyLoadEvent[] = [];
}

describe('TxTable columns, layout and state', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let table: TxTable<City>;
  const narrow = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
  const observed: string[] = [];
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const th = (field: string) => root().querySelector(`th[data-field="${field}"]`) as HTMLElement;
  const headers = () => [...root().querySelectorAll('thead th')].map((cell) => cell.getAttribute('data-field'));
  const names = () => [...root().querySelectorAll('.tx-table__tbody > .tx-table__row')].map((row) => row.querySelector('[data-field="name"]')?.textContent?.trim());
  const fields = () => host.columns.map((column) => column.field);
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const create = async (setup: (host: Host) => void = () => undefined) => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    setup(host);
    fixture.autoDetectChanges();
    await stable();
    table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<City>;
  };
  const pointer = (target: Element, type: string, clientX: number) =>
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX }));
  const sizes = {
    offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth') as PropertyDescriptor,
    offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight') as PropertyDescriptor,
  };
  const size = (name: keyof typeof sizes, value: number) => Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get: () => value });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    observed.length = 0;
    narrow.next({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: (query: string) => {
              observed.push(query);
              return narrow;
            },
          },
        },
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', sizes.offsetWidth);
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', sizes.offsetHeight);
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('freezes the leading service columns with the first column and measures their offsets', async () => {
    size('offsetWidth', 50);
    size('offsetHeight', 40);
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe;
        disconnect = disconnect;
      },
    );
    await create((own) => own.pinned.set([{ id: 9, name: 'Pinned', country: 'UA', people: 1, area: 1 }]));
    expect(headers()).toEqual(['__reorder', '__select', '__expand', 'name', 'country', 'people', 'area', '__editor', '__actions']);
    expect(['__reorder', '__select', '__expand', 'name'].map((field) => th(field).classList.contains('tx-table__cell--frozen'))).toEqual([true, true, true, true]);
    expect(th('name').classList).toContain('tx-table__cell--frozen-last');
    expect(th('__editor').classList).not.toContain('tx-table__cell--frozen');
    expect(th('__actions').classList).toContain('tx-table__cell--frozen-first-end');
    expect(['__reorder', '__select', '__expand', 'name'].map((field) => th(field).style.insetInlineStart)).toEqual(['0px', '50px', '100px', '150px']);
    expect(th('__actions').style.insetInlineEnd).toBe('0px');
    expect((root().querySelector('.tx-table__frozen-tbody') as HTMLElement).style.top).toBe('40px');
    expect(observe).toHaveBeenCalledWith(root().querySelector('.tx-table__header-row'));
    fixture.destroy();
    expect(disconnect).toHaveBeenCalled();
  });

  it('renders own header and footer cells and leaves the actions column unfrozen when asked', async () => {
    await create((own) => own.actionsFrozen.set(false));
    expect(th('people').querySelector('.own-header')?.textContent).toBe('Population');
    expect(root().querySelector('tfoot .own-footer')?.textContent).toBe('km²');
    expect([...root().querySelectorAll('tfoot td')].map((cell) => cell.textContent?.trim())).toContain('Total');
    expect(th('__actions').classList).not.toContain('tx-table__cell--frozen');
    expect(th('name').style.minWidth).toBe('80px');
    expect(th('country').style.width).toBe('120px');
  });

  it('resizes a column with the pointer within its min and max width', async () => {
    size('offsetWidth', 100);
    await create();
    const handle = th('name').querySelector('.tx-table__resizer') as HTMLElement;
    pointer(handle, 'pointerdown', 200);
    await stable();
    expect(root().classList).toContain('tx-table--resizing');
    pointer(handle, 'pointermove', 400);
    await stable();
    expect(th('name').style.width).toBe('200px');
    pointer(handle, 'pointermove', 100);
    await stable();
    expect(th('name').style.width).toBe('80px');
    pointer(handle, 'pointerup', 100);
    await stable();
    expect(root().classList).not.toContain('tx-table--resizing');
    expect(host.resizes).toEqual([{ field: 'name', width: 80 }]);
    pointer(handle, 'pointermove', 300);
    await stable();
    expect(th('name').style.width).toBe('80px');
  });

  it('gives the width to the next column in fit mode and mirrors the pointer in right-to-left layouts', async () => {
    size('offsetWidth', 100);
    await create((own) => own.resizeMode.set('fit'));
    const computed = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => (element.tagName === 'TH' ? ({ direction: 'rtl' } as CSSStyleDeclaration) : computed(element)));
    const handle = th('country').querySelector('.tx-table__resizer') as HTMLElement;
    pointer(handle, 'pointerdown', 200);
    pointer(handle, 'pointermove', 170);
    await stable();
    expect(th('country').style.width).toBe('130px');
    expect(th('people').style.width).toBe('70px');
    pointer(handle, 'pointercancel', 170);
    await stable();
    expect(host.resizes).toEqual([{ field: 'country', width: 130 }]);
  });

  it('reports the measured width when a resize ends without a move', async () => {
    size('offsetWidth', 140);
    await create();
    const handle = th('people').querySelector('.tx-table__resizer') as HTMLElement;
    pointer(handle, 'pointerdown', 10);
    pointer(handle, 'pointerup', 10);
    await stable();
    expect(host.resizes).toEqual([{ field: 'people', width: 140 }]);
  });

  it('reorders data columns by drop and keys and keeps fixed columns in place', async () => {
    await create();
    table.dropColumn({ previousIndex: 3, currentIndex: 5 } as never);
    await stable();
    expect(fields()).toEqual(['country', 'people', 'name', 'area']);
    table.dropColumn({ previousIndex: 0, currentIndex: 4 } as never);
    table.dropColumn({ previousIndex: 3, currentIndex: 20 } as never);
    table.reorderColumn('missing', 'name');
    table.reorderColumn('name', 'name');
    await stable();
    expect(host.reorders).toHaveLength(1);

    const event = () => new KeyboardEvent('keydown', { cancelable: true });
    table.moveColumnBy(host.columns[0], 1, event());
    await stable();
    expect(fields()).toEqual(['people', 'country', 'name', 'area']);
    expect(document.activeElement).not.toBe(th('country'));
    table.moveColumnBy(host.columns[0], -1, event());
    table.moveColumnBy(host.columns[2], 1, event());
    table.moveColumnBy(host.columns[3], -1, event());
    await stable();
    expect(fields()).toEqual(['people', 'country', 'name', 'area']);
    host.reorderable.set(false);
    await stable();
    table.moveColumnBy(host.columns[0], 1, event());
    await stable();
    expect(fields()).toEqual(['people', 'country', 'name', 'area']);
  });

  it('shows hidden columns again and reports filtered columns', async () => {
    await create();
    table.toggleColumn('country', false);
    await stable();
    expect(headers()).not.toContain('country');
    table.toggleColumn('country', true);
    await stable();
    expect(headers()).toContain('country');
    table.applyFilter('name', { operator: 'and', rules: [{ value: 'o', matchMode: 'contains' }] });
    expect(table.isFiltered('name')).toBe(true);
    expect(table.isFiltered('people')).toBe(false);
  });

  it('saves the state in the session storage and clears it', async () => {
    await create((own) => {
      own.stateKey.set('cities');
      own.storage.set('session');
    });
    table.toggleColumn('area', false);
    expect(JSON.parse(sessionStorage.getItem('cities') ?? '{}').hidden).toEqual(['area']);
    expect(localStorage.getItem('cities')).toBeNull();
    table.clearState();
    expect(sessionStorage.getItem('cities')).toBeNull();
    host.stateKey.set(undefined);
    await stable();
    table.clearState();
    table.saveState();
    expect(sessionStorage.length).toBe(0);
  });

  it('restores every saved part of the state', async () => {
    localStorage.setItem(
      'cities',
      JSON.stringify({
        order: ['area', 'name'],
        multiSortMeta: [{ field: 'people', order: 'desc' }],
        sortField: 'people',
        sortOrder: 'desc',
        rows: 3,
        first: 3,
        filters: { country: { operator: 'and', rules: [{ value: 'UA', matchMode: 'equals' }] } },
        globalFilter: 'v',
      }),
    );
    await create((own) => {
      own.stateKey.set('cities');
      own.paginator.set(true);
      own.columns = own.columns.map((column) => (column.field === 'country' ? { ...column, hidden: true } : column));
    });
    expect(fields()).toEqual(['country', 'people', 'area', 'name']);
    expect(headers()).not.toContain('country');
    expect(table.rows()).toBe(3);
    expect(table.multiSortMeta()).toEqual([{ field: 'people', order: 'desc' }]);
    expect(host.search()).toBe('v');
    expect(table.isFiltered('country')).toBe(true);
    expect(host.first()).toBe(0);
    expect(names()).toEqual(['Kyiv', 'Lviv']);
  });

  it('starts from the declared state when the saved state is broken or the storage fails', async () => {
    localStorage.setItem('cities', '{broken');
    await create((own) => {
      own.stateKey.set('cities');
      own.columns = own.columns.map((column) => (column.field === 'area' ? { ...column, hidden: true } : column));
    });
    expect(headers()).not.toContain('area');
    expect(th('country').style.width).toBe('120px');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(() => table.saveState()).not.toThrow();
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => table.saveState()).not.toThrow();
    expect(() => table.clearState()).not.toThrow();
  });

  it('keeps the saved hidden columns over the declared ones and adds new columns', async () => {
    localStorage.setItem('cities', JSON.stringify({ hidden: [], order: ['people', 'name'], widths: { people: 150 } }));
    await create((own) => {
      own.stateKey.set('cities');
      own.columns = own.columns.map((column) => (column.field === 'area' ? { ...column, hidden: true } : column));
    });
    expect(headers()).toContain('area');
    expect(fields()).toEqual(['country', 'people', 'name', 'area']);
    expect(th('people').style.width).toBe('150px');
  });

  it('pulls the page back when rows disappear and rewinds it on filter', async () => {
    await create((own) => {
      own.paginator.set(true);
      own.first.set(10);
    });
    expect(host.first()).toBe(2);
    expect(names()).toEqual(['Gdansk', 'Odesa']);
    host.search.set('kyiv');
    await stable();
    expect(host.first()).toBe(0);
    expect(names()).toEqual(['Kyiv']);
    expect(host.filterEvents).toHaveLength(1);
  });

  it('skips a global filter that changes back before it runs and waits for the delay in lazy mode', async () => {
    await create();
    table.globalFilter.set('x');
    table.globalFilter.set('');
    await stable();
    expect(host.filterEvents).toEqual([]);
    host.lazy.set(true);
    await stable();
    host.search.set('kyiv');
    await stable();
    expect(host.loads.at(-1)?.globalFilter).toBe('kyiv');
  });

  it('shows an empty table for a missing value and blanks for empty cells', async () => {
    await create();
    expect(root().querySelector('tbody [data-field="country"]')?.textContent?.trim()).toBe('UA');
    expect(root().querySelectorAll('tbody .tx-table__row')[2].querySelector('[data-field="country"]')?.textContent?.trim()).toBe('');
    host.value.set(null);
    await stable();
    expect(root().querySelector('.tx-table__empty')?.textContent?.trim()).toBe('No results found');
  });

  it('ignores scrolling outside virtual mode', async () => {
    await create();
    const scroller = root().querySelector('.tx-table__scroller') as HTMLElement;
    scroller.scrollTop = 300;
    scroller.dispatchEvent(new Event('scroll'));
    await stable();
    expect(table.scrollTop()).toBe(0);
  });

  it('turns the breakpoint off with an empty value', async () => {
    await create((own) => own.breakpoint.set(''));
    narrow.next({ matches: true, breakpoints: {} });
    await stable();
    expect(root().classList).not.toContain('tx-table--cards');
    expect(observed).toEqual([]);
  });
});

@Component({
  imports: [TxTable],
  template: `<tx-table ariaLabel="Cities" dataKey="id" [value]="cities" [columns]="columns()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CardHost {
  readonly cities = CITIES;
  readonly columns = signal<TxTableColumn[]>([
    { field: 'country', header: 'Country' },
    { field: 'name', header: 'Name', cardTitle: true },
    { field: 'area', header: 'Area', hideInCard: true },
  ]);
}

describe('TxTable cards', () => {
  it('uses the card title column and drops the title when every column is hidden in cards', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: { observe: () => new BehaviorSubject({ matches: true, breakpoints: {} }) } }] });
    const fixture = TestBed.createComponent(CardHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const card = () => fixture.nativeElement.querySelector('.tx-table__card') as HTMLElement;
    expect(card().querySelector('.tx-table__card-title')?.textContent?.trim()).toBe('Lviv');
    expect([...card().querySelectorAll('.tx-table__card-label')].map((label) => label.textContent)).toEqual(['Country']);
    fixture.componentInstance.columns.set([{ field: 'name', header: 'Name', hideInCard: true }]);
    await fixture.whenStable();
    expect(card().querySelector('.tx-table__card-title')).toBeNull();
    expect(card().querySelectorAll('.tx-table__card-field')).toHaveLength(0);
    fixture.destroy();
  });
});
