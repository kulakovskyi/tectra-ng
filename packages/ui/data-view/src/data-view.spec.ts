import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxDataView } from './data-view.component';
import { TxDataViewLayoutSwitch } from './data-view-layout.component';
import { TxDataViewEmpty, TxDataViewGrid, TxDataViewHeader, TxDataViewList } from './data-view.templates';
import { TxDataViewLayout, TxDataViewLazyLoadEvent, TxDataViewSortOrder } from './data-view.types';

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
