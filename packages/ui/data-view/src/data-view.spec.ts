import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxDataView } from './data-view.component';
import { TxDataViewLayoutSwitch } from './data-view-layout.component';
import {
  TxDataViewEmpty,
  TxDataViewFooter,
  TxDataViewGrid,
  TxDataViewHeader,
  TxDataViewList,
  TxDataViewLoading,
  TxDataViewPaginatorEnd,
  TxDataViewPaginatorStart,
} from './data-view.templates';
import { TxDataViewLayout, TxDataViewLazyLoadEvent, TxDataViewPaginatorPosition, TxDataViewSortOrder } from './data-view.types';

interface Product {
  name: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { name: 'Lamp', price: 40 },
  { name: 'Desk', price: 220 },
  { name: 'Chair', price: 90 },
  { name: 'Shelf', price: 120 },
  { name: 'Rug', price: 60 },
];

@Component({
  imports: [TxDataView, TxDataViewLayoutSwitch, TxDataViewList, TxDataViewGrid, TxDataViewHeader, TxDataViewEmpty],
  template: `<tx-data-view
    [value]="value()"
    [(layout)]="layout"
    [paginator]="paginator()"
    [rows]="2"
    [lazy]="lazy()"
    [loading]="loading()"
    [(sortField)]="sortField"
    [(sortOrder)]="sortOrder"
    filterBy="name"
    [(filterValue)]="query"
    [dt]="{ header: { padding: '20px' } }"
    [pt]="{ content: { class: 'own-content' } }"
    (lazyLoad)="loads.push($event)"
  >
    <ng-template txDataViewHeader><tx-data-view-layout [(layout)]="layout" /></ng-template>
    <ng-template txDataViewList let-items><ul class="list">@for (item of items; track item.name) {<li>{{ item.name }}</li>}</ul></ng-template>
    <ng-template txDataViewGrid let-items><div class="grid">@for (item of items; track item.name) {<span>{{ item.name }}</span>}</div></ng-template>
    <ng-template txDataViewEmpty><p class="none">Nothing</p></ng-template>
  </tx-data-view>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal<Product[]>(PRODUCTS);
  readonly layout = signal<TxDataViewLayout>('list');
  readonly paginator = signal(false);
  readonly lazy = signal(false);
  readonly loading = signal(false);
  readonly sortField = signal<string | null>(null);
  readonly sortOrder = signal<TxDataViewSortOrder>(null);
  readonly query = signal('');
  loads: TxDataViewLazyLoadEvent[] = [];
}

describe('TxDataView', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };
  const names = (selector = '.list li') => Array.from(fixture.nativeElement.querySelectorAll(selector)).map((item) => (item as HTMLElement).textContent);

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await render();
  });

  it('renders the list template with every item', () => {
    expect(names()).toEqual(['Lamp', 'Desk', 'Chair', 'Shelf', 'Rug']);
    const view = fixture.nativeElement.querySelector('tx-data-view') as HTMLElement;
    expect(view.dataset['layout']).toBe('list');
    expect(view.style.getPropertyValue('--tx-data-view-header-padding')).toBe('20px');
    expect(fixture.nativeElement.querySelector('.tx-data-view__content').classList).toContain('own-content');
  });

  it('switches to the grid with the layout switch', async () => {
    const buttons = fixture.nativeElement.querySelectorAll('tx-data-view-layout button') as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    buttons[1].click();
    await render();
    expect(host.layout()).toBe('grid');
    expect(names('.grid span')).toEqual(['Lamp', 'Desk', 'Chair', 'Shelf', 'Rug']);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    buttons[0].click();
    await render();
    expect(host.layout()).toBe('list');
  });

  it('goes back to the first page when the local sort or filter changes', async () => {
    host.paginator.set(true);
    await render();
    (fixture.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement).click();
    await render();
    expect(names()).toEqual(['Chair', 'Shelf']);
    host.sortField.set('name');
    host.sortOrder.set('asc');
    await render();
    expect(names()).toEqual(['Chair', 'Desk']);
    const view = fixture.debugElement.children[0].componentInstance as TxDataView<Product>;
    (fixture.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement).click();
    await render();
    view.sortField.set('price');
    view.sortField.set('name');
    view.filterValue.set('x');
    view.filterValue.set('');
    await render();
    expect(names()).toEqual(['Lamp', 'Rug']);
  });

  it('filters by a field some items lack and through filter()', async () => {
    host.value.set([...PRODUCTS, { price: 5 } as Product]);
    await render();
    const view = fixture.debugElement.children[0].componentInstance as TxDataView<Product>;
    view.filter('rug');
    await render();
    expect(host.query()).toBe('rug');
    expect(names()).toEqual(['Rug']);
  });

  it('sorts, filters and pages locally', async () => {
    host.sortField.set('price');
    host.sortOrder.set('desc');
    await render();
    expect(names()).toEqual(['Desk', 'Shelf', 'Chair', 'Rug', 'Lamp']);
    host.paginator.set(true);
    await render();
    expect(names()).toEqual(['Desk', 'Shelf']);
    (fixture.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement).click();
    await render();
    expect(names()).toEqual(['Chair', 'Rug']);
    host.query.set('la');
    await render();
    expect(names()).toEqual(['Lamp']);
  });

  it('shows the empty template', async () => {
    host.value.set([]);
    await render();
    expect(fixture.nativeElement.querySelector('.none')?.textContent).toBe('Nothing');
  });

  it('asks the server for pages, sort and filter when lazy', async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    host.lazy.set(true);
    host.paginator.set(true);
    await render();
    expect(host.loads).toEqual([{ first: 0, rows: 2, sortField: null, sortOrder: null, filter: '' }]);
    host.sortField.set('name');
    host.sortOrder.set('asc');
    await render();
    expect(host.loads.at(-1)).toEqual({ first: 0, rows: 2, sortField: 'name', sortOrder: 'asc', filter: '' });
    expect(names()).toEqual(['Lamp', 'Desk', 'Chair', 'Shelf', 'Rug']);
    host.loading.set(true);
    await render();
    expect(fixture.nativeElement.querySelector('.tx-data-view__loading tx-progress-spinner')).not.toBeNull();
  });
});

@Component({
  imports: [TxDataView, TxDataViewList, TxDataViewGrid, TxDataViewFooter, TxDataViewLoading, TxDataViewPaginatorStart, TxDataViewPaginatorEnd],
  template: `<tx-data-view
    [value]="value()"
    [layout]="layout()"
    paginator
    [rows]="2"
    [paginatorPosition]="position()"
    [loading]="loading()"
    ariaLabel="Products"
  >
    @if (withList()) {
      <ng-template txDataViewList let-items><ul class="list">@for (item of items; track item.name) {<li>{{ item.name }}</li>}</ul></ng-template>
    } @else {
      <ng-template txDataViewGrid let-items><div class="grid">@for (item of items; track item.name) {<span>{{ item.name }}</span>}</div></ng-template>
    }
    <ng-template txDataViewFooter><p class="foot">Footer</p></ng-template>
    <ng-template txDataViewLoading><p class="wait">Wait</p></ng-template>
    <ng-template txDataViewPaginatorStart let-state><span class="start">from {{ state.first }}</span></ng-template>
    <ng-template txDataViewPaginatorEnd let-state><span class="end">rows {{ state.rows }}</span></ng-template>
  </tx-data-view>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PartsHost {
  readonly value = signal<Product[] | null>(PRODUCTS);
  readonly layout = signal<TxDataViewLayout>('grid');
  readonly position = signal<TxDataViewPaginatorPosition>('both');
  readonly loading = signal(false);
  readonly withList = signal(true);
}

describe('TxDataView parts', () => {
  let fixture: ComponentFixture<PartsHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(PartsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('falls back to the other layout template and names the content', async () => {
    expect(all('.list li').map((item) => item.textContent)).toEqual(['Lamp', 'Desk']);
    expect(el('.tx-data-view__content')?.getAttribute('role')).toBe('region');
    expect(el('.tx-data-view__content')?.getAttribute('aria-label')).toBe('Products');
    fixture.componentInstance.withList.set(false);
    fixture.componentInstance.layout.set('list');
    await fixture.whenStable();
    expect(all('.grid span').map((item) => item.textContent)).toEqual(['Lamp', 'Desk']);
  });

  it('puts paginators on both sides with own start and end content, a footer and a loading template', async () => {
    expect(all('tx-paginator')).toHaveLength(2);
    expect(all('tx-paginator')[0].classList).toContain('tx-data-view__paginator--top');
    expect(el('.start')?.textContent).toBe('from 0');
    expect(el('.end')?.textContent).toBe('rows 2');
    expect(el('.tx-data-view__footer .foot')?.textContent).toBe('Footer');
    fixture.componentInstance.position.set('top');
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(all('tx-paginator')).toHaveLength(1);
    expect(el('.tx-data-view__loading .wait')?.textContent).toBe('Wait');
  });

  it('shows the default empty message for no value', async () => {
    fixture.componentInstance.value.set(null);
    await fixture.whenStable();
    expect(el('.tx-data-view__empty')?.textContent?.trim()).toBe('No results found');
  });
});
