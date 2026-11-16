import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TxTable } from './table.component';
import { TxTableCard, TxTableExpansion, TxTableGroupFooter, TxTableGroupHeader } from './table.templates';
import { TxTableColumn, TxTableRowGroupMode } from './table.types';

interface Task {
  id: number;
  title: string;
  team: string;
}

const TASKS: Task[] = [
  { id: 1, title: 'Plan', team: 'Core' },
  { id: 2, title: 'Build', team: 'Web' },
  { id: 3, title: 'Test', team: 'Core' },
  { id: 4, title: 'Ship', team: 'Web' },
];

@Component({
  imports: [TxTable, TxTableGroupHeader, TxTableGroupFooter, TxTableExpansion, TxTableCard],
  template: `
    <tx-table
      ariaLabel="Tasks"
      dataKey="id"
      [value]="tasks"
      [columns]="columns"
      [groupRowsBy]="groupBy()"
      [rowGroupMode]="groupMode()"
      [expandableRowGroups]="expandableGroups()"
      [expandableRows]="expandable"
      [(expandedRowKeys)]="expanded"
      (rowExpand)="opened.push($event.row.id)"
      (rowCollapse)="closed.push($event.row.id)"
    >
      @if (ownHeader()) {
        <ng-template txTableGroupHeader [txTableGroupHeaderOf]="tasks" let-value="value" let-rows="rows">
          <span class="own-header">{{ value }}: {{ rows.length }}</span>
        </ng-template>
      }
      <ng-template txTableGroupFooter [txTableGroupFooterOf]="tasks" let-value="value">
        <span class="footer">End of {{ value }}</span>
      </ng-template>
      @if (withExpansion()) {
        <ng-template txTableExpansion [txTableExpansionOf]="tasks" let-task let-node="node">
          <p class="details">{{ task.title }} #{{ node.id }}</p>
        </ng-template>
      }
      @if (ownCard()) {
        <ng-template txTableCard [txTableCardOf]="tasks" let-task>
          <span class="own-card">{{ task.title }}</span>
        </ng-template>
      }
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CardHost {
  readonly tasks = TASKS;
  readonly columns: TxTableColumn[] = [
    { field: 'title', header: 'Title' },
    { field: 'team', header: 'Team' },
  ];
  readonly groupBy = signal<string | undefined>('team');
  readonly groupMode = signal<TxTableRowGroupMode>('subheader');
  readonly expandableGroups = signal(true);
  readonly ownHeader = signal(false);
  readonly ownCard = signal(false);
  readonly withExpansion = signal(true);
  readonly expandable = (task: Task) => task.id !== 4;
  readonly expanded = signal<unknown[]>([]);
  readonly opened: number[] = [];
  readonly closed: number[] = [];
}

describe('TxTable card view', () => {
  let fixture: ComponentFixture<CardHost>;
  let host: CardHost;
  let table: TxTable<Task>;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const all = <E extends Element = HTMLElement>(selector: string) => [...root().querySelectorAll<E>(selector)] as unknown as E[];
  const list = () => [...(root().querySelector('.tx-table__cards')?.children ?? [])] as HTMLElement[];
  const stable = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  };
  const transition = (target: Element, propertyName: string) => {
    const event = new Event('transitionend', { bubbles: true });
    Object.defineProperty(event, 'propertyName', { value: propertyName });
    target.dispatchEvent(event);
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: { observe: () => new BehaviorSubject({ matches: true, breakpoints: {} }) } }] });
    fixture = TestBed.createComponent(CardHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
    table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Task>;
  });

  afterEach(() => fixture.destroy());

  it('puts the group header before the first card of every group and the footer after its last one', () => {
    expect(table.cardView()).toBe(true);
    expect(list().map((item) => item.className.includes('tx-table__card-group') ? `[${item.textContent?.trim().replace(/\s+/g, ' ')}]` : item.querySelector('.tx-table__card-title')?.textContent?.trim())).toEqual([
      '[Core2 rows]',
      'Plan',
      'Test',
      '[End of Core]',
      '[Web2 rows]',
      'Build',
      'Ship',
      '[End of Web]',
    ]);
    expect(list().every((item) => item.getAttribute('role') === 'listitem')).toBe(true);
  });

  it('collapses a group of cards from its header', async () => {
    const toggle = all('.tx-table__card-group .tx-table__row-toggle')[0];
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse row');
    toggle.click();
    await stable();
    expect(all('.tx-table__card').map((card) => card.querySelector('.tx-table__card-title')?.textContent?.trim())).toEqual(['Build', 'Ship']);
    const collapsed = all('.tx-table__card-group .tx-table__row-toggle')[0];
    expect(collapsed.getAttribute('aria-expanded')).toBe('false');
    expect(collapsed.getAttribute('aria-label')).toBe('Expand row');
  });

  it('renders an own group header in the card view and no toggle without expandable groups', async () => {
    host.ownHeader.set(true);
    host.expandableGroups.set(false);
    await stable();
    expect(all('.own-header').map((header) => header.textContent)).toEqual(['Core: 2', 'Web: 2']);
    expect(all('.tx-table__card-group .tx-table__row-toggle')).toHaveLength(0);
  });

  it('leaves the group headers out in rowspan mode and without grouping', async () => {
    host.groupMode.set('rowspan');
    await stable();
    expect(all('.tx-table__card-group')).toHaveLength(0);
    host.groupMode.set('subheader');
    host.groupBy.set(undefined);
    await stable();
    expect(all('.tx-table__card-group')).toHaveLength(0);
    expect(all('.tx-table__card')).toHaveLength(4);
  });

  it('expands a card with its own button and closes it after the transition', async () => {
    const toggles = () => all('.tx-table__card-toggle');
    expect(toggles()).toHaveLength(3);
    const first = toggles()[0];
    const region = root().querySelector(`#${first.getAttribute('aria-controls')}`) as HTMLElement;
    expect(region.classList).toContain('tx-table__card-expansion');
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(first.textContent?.trim()).toBe('Expand row');
    expect(root().querySelector('.details')).toBeNull();
    first.click();
    await stable();
    expect(host.expanded()).toEqual([1]);
    expect(host.opened).toEqual([1]);
    expect(toggles()[0].getAttribute('aria-expanded')).toBe('true');
    expect(toggles()[0].textContent?.trim()).toBe('Collapse row');
    expect(root().querySelector('.details')?.textContent).toBe('Plan #1');
    expect(region.classList).toContain('tx-table__expansion-body--open');
    toggles()[0].click();
    await stable();
    expect(host.closed).toEqual([1]);
    expect(root().querySelector('.details')).toBeTruthy();
    transition(region, 'grid-template-rows');
    await stable();
    expect(root().querySelector('.details')).toBeNull();
  });

  it('adds the expansion to an own card and drops it without an expansion template', async () => {
    host.ownCard.set(true);
    host.expanded.set([2]);
    await stable();
    expect(all('.own-card')).toHaveLength(4);
    expect(all('.tx-table__card--custom .tx-table__card-toggle')).toHaveLength(3);
    expect(root().querySelector('.details')?.textContent).toBe('Build #2');
    host.withExpansion.set(false);
    await stable();
    expect(all('.tx-table__card-toggle')).toHaveLength(0);
  });
});

@Component({
  imports: [TxTable, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tx-table ariaLabel="Tasks" dataKey="id" selectionMode="checkbox" [value]="tasks" [columns]="columns" />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormHost {
  readonly form = new FormGroup({ note: new FormControl('') });
  readonly tasks = TASKS;
  readonly columns: TxTableColumn[] = [{ field: 'title', header: 'Title', editable: true }];
}

describe('TxTable inside a form', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps its own checkboxes out of the parent form in both views', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const narrow = new BehaviorSubject({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow } }] });
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    narrow.next({ matches: true, breakpoints: {} });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tx-table__card tx-checkbox')).toHaveLength(4);
    expect(warn).not.toHaveBeenCalled();
    expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['note']);
    fixture.destroy();
  });
});
