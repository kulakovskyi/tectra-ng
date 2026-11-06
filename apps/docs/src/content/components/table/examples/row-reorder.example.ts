import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTable, TxTableColumn, TxTableRowReorderEvent } from '@tectra/ui/table';

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
  selector: 'table-row-reorder-example',
  imports: [TxTable],
  template: `
    <tx-table
      ariaLabel="Tasks"
      dataKey="id"
      reorderableRows
      [value]="tasks()"
      [columns]="columns"
      (rowReorder)="reorder($event)"
    />
    <p class="status">Order: {{ order() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TableRowReorderExample {
  readonly tasks = signal(TASKS.slice(0, 5));
  readonly columns: TxTableColumn[] = [
    { field: 'title', header: 'Task', initialWidth: '240px', sortable: false },
    { field: 'owner', header: 'Owner', sortable: false },
  ];

  reorder(event: TxTableRowReorderEvent<Task>): void {
    this.tasks.set(event.value);
  }

  order(): string {
    return this.tasks()
      .map((task) => task.id)
      .join(', ');
  }
}
