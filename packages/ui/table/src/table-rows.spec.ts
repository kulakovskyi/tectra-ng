import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { TxTableExpansion, TxTableGroupFooter, TxTableGroupHeader } from './table.templates';
import { TxTableColumn, TxTableRowGroupMode, TxTableRowReorderEvent } from './table.types';

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
  imports: [TxTable, TxTableGroupFooter],
  template: `
    <tx-table
      ariaLabel="Tasks"
      dataKey="id"
      [value]="tasks()"
      [columns]="columns"
      [reorderableRows]="reorder()"
      [frozenValue]="pinned()"
      [groupRowsBy]="groupBy()"
      [rowGroupMode]="groupMode()"
      [expandableRowGroups]="true"
      [(expandedRowGroups)]="openGroups"
      (rowReorder)="onReorder($event)"
    >
      <ng-template txTableGroupFooter let-count="count" let-value="value">
        <span class="footer">{{ value }}: {{ count }}</span>
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tasks = signal<Task[]>(TASKS);
  readonly columns: TxTableColumn[] = [
    { field: 'title', header: 'Title' },
    { field: 'team', header: 'Team' },
  ];
  readonly reorder = signal(false);
  readonly pinned = signal<Task[] | undefined>(undefined);
  readonly groupBy = signal<string | undefined>(undefined);
  readonly groupMode = signal<TxTableRowGroupMode>('subheader');
  readonly openGroups = signal<unknown[] | null>(null);
  readonly moves: TxTableRowReorderEvent[] = [];
  readonly sync = signal(true);

  onReorder(event: TxTableRowReorderEvent<Task>): void {
    this.moves.push(event);
    if (this.sync()) this.tasks.set(event.value);
  }
}

describe('TxTable rows', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
  const titles = () => [...root().querySelectorAll('.tx-table__tbody > .tx-table__row')].map((row) => row.querySelector('[data-field="title"]')?.textContent?.trim());
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
  });

  afterEach(() => fixture.destroy());

  it('moves rows with the handle keys and reports the new order', async () => {
    host.reorder.set(true);
    await stable();
    const handles = () => [...root().querySelectorAll<HTMLElement>('.tx-table__row-handle')];
    expect(handles()[0].getAttribute('aria-label')).toBe('Move row');
    handles()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
    await stable();
    expect(titles()).toEqual(['Build', 'Plan', 'Test', 'Ship']);
    expect(host.moves[0]).toMatchObject({ from: 0, to: 1 });
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable;
    table.dropRow({ previousIndex: 3, currentIndex: 0 } as never);
    await stable();
    expect(titles()).toEqual(['Ship', 'Build', 'Plan', 'Test']);
  });

  it('keeps its own order while the value stays the same and skips moves that go nowhere', async () => {
    host.reorder.set(true);
    host.sync.set(false);
    await stable();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Task>;
    table.dropRow({ previousIndex: 0, currentIndex: 2 } as never);
    await stable();
    expect(titles()).toEqual(['Build', 'Test', 'Plan', 'Ship']);
    expect(host.tasks()).toBe(TASKS);
    table.dropRow({ previousIndex: 1, currentIndex: 1 } as never);
    table.dropRow({ previousIndex: 1, currentIndex: 9 } as never);
    const handles = () => [...root().querySelectorAll<HTMLElement>('.tx-table__row-handle')];
    handles()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
    handles()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
    await stable();
    expect(host.moves).toHaveLength(1);
    host.tasks.set([...TASKS]);
    await stable();
    expect(titles()).toEqual(['Plan', 'Build', 'Test', 'Ship']);
  });

  it('sorts inside groups and expands a collapsed group again', async () => {
    host.groupBy.set('team');
    await stable();
    const table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Task>;
    table.sort({ field: 'title' }, new MouseEvent('click'));
    await stable();
    expect(titles()).toEqual(['Plan', 'Test', 'Build', 'Ship']);
    table.sort({ field: 'team' }, new MouseEvent('click'));
    table.sort({ field: 'team' }, new MouseEvent('click'));
    await stable();
    expect(titles()).toEqual(['Build', 'Ship', 'Plan', 'Test']);
    const toggle = () => root().querySelector('.tx-table__group-header .tx-table__row-toggle') as HTMLElement;
    toggle().click();
    await stable();
    expect(host.openGroups()).toEqual(['Core']);
    toggle().click();
    await stable();
    expect(host.openGroups()).toEqual(['Core', 'Web']);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    table.toggleGroup({ ...table.renderRows()[0], group: null });
    expect(host.openGroups()).toEqual(['Core', 'Web']);
  });

  it('pins frozen rows above the body', async () => {
    host.pinned.set([{ id: 9, title: 'Pinned', team: 'Ops' }]);
    await stable();
    const frozen = root().querySelector('.tx-table__frozen-tbody') as HTMLElement;
    expect(frozen.querySelector('[data-field="title"]')?.textContent?.trim()).toBe('Pinned');
    expect(titles()).toHaveLength(4);
  });

  it('groups rows under headers, collapses a group and renders the footer', async () => {
    host.groupBy.set('team');
    await stable();
    expect(titles()).toEqual(['Plan', 'Test', 'Build', 'Ship']);
    const headers = [...root().querySelectorAll('.tx-table__group-header')];
    expect(headers.map((header) => header.querySelector('.tx-table__group-title')?.textContent)).toEqual(['Core', 'Web']);
    expect(headers[0].querySelector('.tx-table__group-count')?.textContent).toBe('2 rows');
    expect([...root().querySelectorAll('.footer')].map((footer) => footer.textContent)).toEqual(['Core: 2', 'Web: 2']);
    (headers[0].querySelector('.tx-table__row-toggle') as HTMLElement).click();
    await stable();
    const collapsed = [...root().querySelectorAll('.tx-table__tbody > .tx-table__row--collapsed')];
    expect(collapsed.map((row) => row.querySelector('[data-field="title"]')?.textContent?.trim())).toEqual(['Plan', 'Test']);
    expect(collapsed.every((row) => row.hasAttribute('inert') && row.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(root().querySelectorAll('.tx-table__tbody > .tx-table__row:not(.tx-table__row--collapsed)')).toHaveLength(2);
    expect(root().querySelector('.tx-table__cell-body')).toBeTruthy();
    expect(host.openGroups()).toEqual(['Web']);
  });

  it('spans the group cell over its rows in rowspan mode', async () => {
    host.groupBy.set('team');
    host.groupMode.set('rowspan');
    await stable();
    const teamCells = [...root().querySelectorAll<HTMLElement>('.tx-table__tbody [data-field="team"]')];
    expect(teamCells.map((cell) => [cell.textContent?.trim(), cell.getAttribute('rowspan')])).toEqual([
      ['Core', '2'],
      ['Web', '2'],
    ]);
    expect(root().querySelector('.tx-table__group-header')).toBeNull();
  });
});

@Component({
  imports: [TxTable, TxTableGroupHeader, TxTableExpansion],
  template: `
    <tx-table
      ariaLabel="Tasks"
      dataKey="id"
      groupRowsBy="team"
      [value]="tasks"
      [columns]="columns"
      [expandableRowGroups]="true"
      [expandableRows]="expandable"
      [(expandedRowKeys)]="expanded"
      (rowGroupToggle)="toggles.push($event)"
    >
      <ng-template txTableGroupHeader let-value="value" let-count="count" let-rows="rows" let-collapsed="collapsed" let-toggle="toggle">
        <button type="button" class="own-toggle" [attr.data-collapsed]="collapsed" (click)="toggle()">{{ value }} ({{ count }}: {{ rows.length }})</button>
      </ng-template>
      <ng-template txTableExpansion let-task><p class="details">{{ task.title }}</p></ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GroupHost {
  readonly tasks = TASKS;
  readonly columns: TxTableColumn[] = [{ field: 'title', header: 'Title' }];
  readonly expandable = (task: Task) => task.team === 'Core';
  readonly expanded = signal<unknown[]>([]);
  readonly toggles: { value: unknown; expanded: boolean }[] = [];
}

describe('TxTable group headers and expandable rows', () => {
  let fixture: ComponentFixture<GroupHost>;
  let host: GroupHost;
  let table: TxTable<Task>;
  const root = () => fixture.nativeElement.querySelector('tx-table') as HTMLElement;
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
    fixture = TestBed.createComponent(GroupHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await stable();
    table = fixture.debugElement.query((node) => node.componentInstance instanceof TxTable).componentInstance as TxTable<Task>;
  });

  afterEach(() => fixture.destroy());

  it('renders an own group header that toggles its group', async () => {
    const own = () => [...root().querySelectorAll<HTMLElement>('.own-toggle')];
    expect(own().map((button) => button.textContent?.trim())).toEqual(['Core (2: 2)', 'Web (2: 2)']);
    own()[1].click();
    await stable();
    expect(host.toggles).toEqual([{ value: 'Web', expanded: false }]);
    expect(own()[1].getAttribute('data-collapsed')).toBe('true');
  });

  it('expands only expandable rows and finishes closing on the grid transition of its own body', async () => {
    const toggles = () => [...root().querySelectorAll<HTMLElement>('.tx-table__tbody .tx-table__row-toggle')].filter((button) => !button.closest('.tx-table__group-header'));
    expect(toggles()).toHaveLength(2);
    host.expanded.set([1, 2]);
    await stable();
    expect([...root().querySelectorAll('.details')].map((details) => details.textContent)).toEqual(['Plan']);
    toggles()[0].click();
    await stable();
    toggles()[0].click();
    await stable();
    expect(host.expanded()).toEqual([2, 1]);
    expect(table.closingKeys()).toEqual([]);
    toggles()[0].click();
    await stable();
    const body = root().querySelector('.tx-table__expansion-body') as HTMLElement;
    transition(body.querySelector('.tx-table__expansion-inner') as HTMLElement, 'grid-template-rows');
    transition(body, 'opacity');
    expect(table.closingKeys()).toEqual([1]);
    transition(body, 'grid-template-rows');
    await stable();
    expect(table.closingKeys()).toEqual([]);
    expect(root().querySelector('.details')).toBeNull();
    table.finishClosing(1);
    table.toggleNode(table.renderRows()[0], new MouseEvent('click'));
    await stable();
    expect(host.expanded()).toEqual([2, 1]);
  });
});
