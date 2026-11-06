import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTable } from './table.component';
import { TxTableGroupFooter } from './table.templates';
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
      (rowReorder)="moves.push($event); tasks.set($event.value)"
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
