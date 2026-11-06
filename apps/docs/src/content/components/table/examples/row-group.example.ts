import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableColumn, TxTableGroupFooter } from '@tectra/ui/table';

interface Task {
  id: number;
  title: string;
  team: string;
  owner: string;
  hours: number;
}

const TASKS: Task[] = [
  { id: 1, title: 'Write release notes', team: 'Docs', owner: 'Olena', hours: 3 },
  { id: 2, title: 'Fix the login form', team: 'Web', owner: 'Andrii', hours: 5 },
  { id: 3, title: 'Review the API', team: 'Core', owner: 'Iryna', hours: 2 },
  { id: 4, title: 'Update screenshots', team: 'Docs', owner: 'Marta', hours: 1 },
  { id: 5, title: 'Speed up the search', team: 'Core', owner: 'Bohdan', hours: 8 },
  { id: 6, title: 'Polish the settings page', team: 'Web', owner: 'Olena', hours: 4 },
];

@Component({
  selector: 'table-row-group-example',
  imports: [TxTable, TxTableGroupFooter],
  template: `
    <tx-table
      ariaLabel="Tasks by team"
      dataKey="id"
      groupRowsBy="team"
      expandableRowGroups
      [value]="tasks"
      [columns]="columns"
    >
      <ng-template txTableGroupFooter let-rows="rows" let-value="value">
        <span class="total">{{ value }}: {{ hours(rows) }} h</span>
      </ng-template>
    </tx-table>
    <tx-table
      ariaLabel="Tasks by team, spanned"
      dataKey="id"
      groupRowsBy="team"
      rowGroupMode="rowspan"
      [value]="tasks"
      [columns]="spanColumns"
    />
  `,
  styles: `
    :host {
      display: grid;
      gap: 24px;
    }
    .total {
      display: block;
      text-align: end;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableRowGroupExample {
  readonly tasks = TASKS;
  readonly columns: TxTableColumn[] = [
    { field: 'title', header: 'Task', initialWidth: '240px' },
    { field: 'owner', header: 'Owner' },
    { field: 'hours', header: 'Hours', align: 'end' },
  ];
  readonly spanColumns: TxTableColumn[] = [
    { field: 'team', header: 'Team' },
    { field: 'title', header: 'Task', initialWidth: '240px' },
    { field: 'owner', header: 'Owner' },
  ];

  hours(rows: Task[]): number {
    return rows.reduce((sum, task) => sum + task.hours, 0);
  }
}
