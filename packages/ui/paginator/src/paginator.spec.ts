import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TxPaginator } from './paginator.component';
import { TxPaginatorEnd, TxPaginatorStart } from './paginator.templates';
import { TxPageState, TxRowsPerPageOption } from './paginator.types';
import { firstToPage, pageCountOf, pageLinksOf, pageToFirst } from './paginator.utils';

@Component({
  imports: [TxPaginator, TxPaginatorStart, TxPaginatorEnd],
  template: `
    <tx-paginator
      [(first)]="first"
      [(rows)]="rows"
      [totalRecords]="total()"
      [rowsPerPageOptions]="options()"
      [showCurrentPageReport]="report()"
      [currentPageReportTemplate]="reportTemplate()"
      [showJumpToPageInput]="jumpInput()"
      [showTotal]="showTotal()"
      [alwaysShow]="alwaysShow()"
      [disabled]="disabled()"
      [pt]="{ bar: { class: 'own-bar' } }"
      [dt]="{ navButton: { borderRadius: '50%' } }"
      (pageChange)="changes.push($event)"
    >
      <ng-template txPaginatorStart let-state>
        <span class="start">page {{ state.page }}</span>
      </ng-template>
      <ng-template txPaginatorEnd let-state>
        <span class="end">of {{ state.pageCount }}</span>
      </ng-template>
    </tx-paginator>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly total = signal(120);
  readonly options = signal<TxRowsPerPageOption[] | undefined>(undefined);
  readonly report = signal(false);
  readonly reportTemplate = signal<string | undefined>(undefined);
  readonly jumpInput = signal(false);
  readonly showTotal = signal(false);
  readonly alwaysShow = signal(true);
  readonly disabled = signal(false);
  readonly changes: TxPageState[] = [];
}

describe('paginator utils', () => {
  it('counts pages and converts between pages and records', () => {
    expect(pageCountOf(0, 10)).toBe(0);
    expect(pageCountOf(101, 10)).toBe(11);
    expect(pageCountOf(5, 0)).toBe(1);
    expect(firstToPage(25, 10)).toBe(2);
    expect(pageToFirst(3, 20)).toBe(60);
    expect(firstToPage(25, 0)).toBe(0);
  });

  it('keeps a window of page links around the current page', () => {
    expect(pageLinksOf(0, 12, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(pageLinksOf(6, 12, 5)).toEqual([4, 5, 6, 7, 8]);
    expect(pageLinksOf(11, 12, 5)).toEqual([7, 8, 9, 10, 11]);
    expect(pageLinksOf(1, 3, 5)).toEqual([0, 1, 2]);
    expect(pageLinksOf(0, 0, 5)).toEqual([]);
  });
});

describe('TxPaginator', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const compact = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
  const root = () => fixture.nativeElement.querySelector('tx-paginator') as HTMLElement;
  const el = (selector: string) => root().querySelector(selector) as HTMLElement;
  const all = (selector: string) => [...root().querySelectorAll<HTMLElement>(selector)];
  const pageNumbers = () => all('.tx-paginator__page').map((button) => button.textContent?.trim());

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: { observe: () => compact } }] });
    compact.next({ matches: false, breakpoints: {} });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('renders the navigation with named buttons and the current page', () => {
    expect(el('nav').getAttribute('aria-label')).toBe('Pagination');
    expect(el('.tx-paginator__first').getAttribute('aria-label')).toBe('First page');
    expect(el('.tx-paginator__previous').getAttribute('aria-label')).toBe('Previous page');
    expect(el('.tx-paginator__next').getAttribute('aria-label')).toBe('Next page');
    expect(el('.tx-paginator__last').getAttribute('aria-label')).toBe('Last page');
    expect(pageNumbers()).toEqual(['1', '2', '3', '4', '5']);
    expect(el('[aria-current="page"]').textContent?.trim()).toBe('1');
    expect(el('[aria-current="page"]').getAttribute('aria-label')).toBe('Page 1');
    expect((el('.tx-paginator__first') as HTMLButtonElement).disabled).toBe(true);
    expect((el('.tx-paginator__previous') as HTMLButtonElement).disabled).toBe(true);
  });

  it('moves between pages and emits the page state', async () => {
    el('.tx-paginator__next').click();
    await fixture.whenStable();
    expect(host.first()).toBe(10);
    expect(host.changes.at(-1)).toEqual({ page: 1, first: 10, rows: 10, pageCount: 12 });

    all('.tx-paginator__page')[3].click();
    await fixture.whenStable();
    expect(host.first()).toBe(30);
    expect(pageNumbers()).toEqual(['2', '3', '4', '5', '6']);

    el('.tx-paginator__last').click();
    await fixture.whenStable();
    expect(host.changes.at(-1)).toEqual({ page: 11, first: 110, rows: 10, pageCount: 12 });
    expect((el('.tx-paginator__next') as HTMLButtonElement).disabled).toBe(true);
    expect((el('.tx-paginator__last') as HTMLButtonElement).disabled).toBe(true);

    el('.tx-paginator__previous').click();
    el('.tx-paginator__first').click();
    await fixture.whenStable();
    expect(host.first()).toBe(0);
    expect(host.changes).toHaveLength(5);
  });

  it('does not emit for the current page', async () => {
    el('[aria-current="page"]').click();
    await fixture.whenStable();
    expect(host.changes).toHaveLength(0);
  });

  it('builds the page size options with the current rows and a show-all item', async () => {
    host.rows.set(20);
    host.options.set([5, 10, 50, { showAll: 'All' }]);
    await fixture.whenStable();
    const paginator = fixture.debugElement.children[0].componentInstance as TxPaginator;
    expect(paginator.rowsPerPageItems()).toEqual([
      { label: '5', value: 5 },
      { label: '10', value: 10 },
      { label: '20', value: 20 },
      { label: '50', value: 50 },
      { label: 'All', value: 120 },
    ]);
    expect(el('.tx-paginator__rpp-dropdown')).toBeTruthy();

    host.options.set([]);
    await fixture.whenStable();
    expect(el('.tx-paginator__rpp-dropdown')).toBeNull();
  });

  it('keeps the first visible record when the page size changes', async () => {
    host.first.set(30);
    await fixture.whenStable();
    const paginator = fixture.debugElement.children[0].componentInstance as TxPaginator;
    paginator.changeRows(25);
    await fixture.whenStable();
    expect(host.rows()).toBe(25);
    expect(host.first()).toBe(25);
    expect(host.changes.at(-1)).toEqual({ page: 1, first: 25, rows: 25, pageCount: 5 });
  });

  it('writes the current page report with the placeholders', async () => {
    host.report.set(true);
    host.first.set(20);
    await fixture.whenStable();
    expect(el('.tx-paginator__report').textContent?.trim()).toBe('3 of 12');

    host.reportTemplate.set('{first}–{last} of {totalRecords} ({rows} per page, {unknown})');
    await fixture.whenStable();
    expect(el('.tx-paginator__report').textContent?.trim()).toBe('21–30 of 120 (10 per page, {unknown})');
  });

  it('jumps to a typed page on Enter and clamps it', async () => {
    host.jumpInput.set(true);
    await fixture.whenStable();
    const input = el('.tx-paginator__jump-input') as HTMLInputElement;
    expect(input.value).toBe('1');
    input.value = '4';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(host.first()).toBe(30);

    input.value = '99';
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(host.first()).toBe(110);
    expect(input.value).toBe('12');

    input.value = 'x';
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(input.value).toBe('12');
  });

  it('shows the translated total', async () => {
    host.showTotal.set(true);
    await fixture.whenStable();
    expect(el('.tx-paginator__total').textContent?.trim()).toBe('Total: 120');
    expect(root().classList).toContain('tx-paginator--with-total');
  });

  it('goes compact below the breakpoint: fewer links, no first and last buttons', async () => {
    host.first.set(50);
    compact.next({ matches: true, breakpoints: {} });
    await fixture.whenStable();
    expect(root().classList).toContain('tx-paginator--compact');
    expect(pageNumbers()).toEqual(['5', '6', '7']);
    expect(el('.tx-paginator__first')).toBeNull();
    expect(el('.tx-paginator__last')).toBeNull();
  });

  it('hides itself with a single page unless alwaysShow', async () => {
    host.total.set(5);
    await fixture.whenStable();
    expect(root().hasAttribute('hidden')).toBe(false);
    host.alwaysShow.set(false);
    await fixture.whenStable();
    expect(root().hasAttribute('hidden')).toBe(true);
  });

  it('moves to the last page when the total shrinks below the first record', async () => {
    host.first.set(110);
    await fixture.whenStable();
    host.total.set(45);
    await fixture.whenStable();
    expect(host.first()).toBe(40);
    expect(host.changes.at(-1)).toEqual({ page: 4, first: 40, rows: 10, pageCount: 5 });
  });

  it('disables every control', async () => {
    host.disabled.set(true);
    await fixture.whenStable();
    expect(all('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });

  it('renders the start and end templates with the page state', async () => {
    host.first.set(20);
    await fixture.whenStable();
    expect(el('.start').textContent).toBe('page 2');
    expect(el('.end').textContent).toBe('of 12');
  });

  it('keeps the page size options as given when they contain the rows', async () => {
    host.options.set([5, 10]);
    await fixture.whenStable();
    const paginator = fixture.debugElement.children[0].componentInstance as TxPaginator;
    expect(paginator.rowsPerPageItems()).toEqual([
      { label: '5', value: 5 },
      { label: '10', value: 10 },
    ]);
  });

  it('reports zeros for an empty list', async () => {
    host.report.set(true);
    host.reportTemplate.set('{currentPage}/{totalPages}: {first}-{last}');
    host.total.set(0);
    await fixture.whenStable();
    expect(el('.tx-paginator__report').textContent?.trim()).toBe('0/0: 0-0');
  });

  it('ignores pages out of range, page sizes that change nothing and any change while disabled', async () => {
    const paginator = fixture.debugElement.children[0].componentInstance as TxPaginator;
    paginator.changePage(-1);
    paginator.changePage(12);
    paginator.changeRows(null);
    paginator.changeRows(0);
    paginator.changeRows(10);
    host.disabled.set(true);
    await fixture.whenStable();
    paginator.changePage(3);
    await fixture.whenStable();
    expect(host.changes).toEqual([]);
    expect(host.first()).toBe(0);
    expect(host.rows()).toBe(10);
  });

  it('applies dt and pt', () => {
    expect(root().style.getPropertyValue('--tx-paginator-nav-button-border-radius')).toBe('50%');
    expect(el('nav').classList).toContain('own-bar');
    expect(root().hasAttribute('data-styled')).toBe(true);
  });
});

describe('TxPaginator unstyled', () => {
  it('drops the styled marker', async () => {
    @Component({
      imports: [TxPaginator],
      template: `<tx-paginator unstyled [rows]="10" [totalRecords]="30" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class UnstyledHost {}

    const fixture = TestBed.createComponent(UnstyledHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-paginator') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelectorAll('.tx-paginator__page')).toHaveLength(3);
  });
});

@Component({
  imports: [TxPaginator],
  template: `<tx-paginator [rows]="10" [totalRecords]="30" [compactBreakpoint]="null" showJumpToPageDropdown />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DropdownHost {}

describe('TxPaginator with a page dropdown', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('lists every page in the dropdown and never goes compact without a breakpoint', async () => {
    const fixture = TestBed.createComponent(DropdownHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const paginator = fixture.debugElement.children[0].componentInstance as TxPaginator;
    expect(paginator.jumpToPageItems()).toEqual([
      { label: '1', value: 0 },
      { label: '2', value: 1 },
      { label: '3', value: 2 },
    ]);
    expect(fixture.nativeElement.querySelector('.tx-paginator__jump-dropdown')).not.toBeNull();
    expect(paginator.compact()).toBe(false);
    expect(fixture.nativeElement.querySelector('.tx-paginator__first')).not.toBeNull();
  });
});

describe('TxPaginator recompiled by TestBed', () => {
  it('still finds its start and end templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxPaginator, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.start').textContent).toBe('page 0');
    expect(fixture.nativeElement.querySelector('.end').textContent).toBe('of 12');
  });
});

