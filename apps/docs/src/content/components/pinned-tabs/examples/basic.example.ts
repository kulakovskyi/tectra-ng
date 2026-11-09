import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxPinnedTabs } from '@tectra-ng/blocks/pinned-tabs';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxTable, TxTableColumn } from '@tectra-ng/ui/table';

const TEAMS = [
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'platform', label: 'Platform' },
  { value: 'growth', label: 'Growth' },
  { value: 'finance', label: 'Finance' },
];

const TASKS = [
  { id: 1, task: 'Refresh the pricing page', team: 'design' },
  { id: 2, task: 'Call back three leads', team: 'sales' },
  { id: 3, task: 'Answer the weekend tickets', team: 'support' },
  { id: 4, task: 'Upgrade the database', team: 'platform' },
  { id: 5, task: 'Launch the spring campaign', team: 'growth' },
  { id: 6, task: 'Close the quarter', team: 'finance' },
  { id: 7, task: 'New onboarding screens', team: 'design' },
];

@Component({
  selector: 'pinned-tabs-basic-example',
  imports: [FormsModule, TxPinnedTabs, TxMultiselect, TxTable],
  template: `
    <div class="column">
      <div class="bar">
        <tx-pinned-tabs
          class="tabs"
          stateKey="docs-pinned-tabs-teams"
          allLabel="All teams"
          ariaLabel="Teams"
          [options]="teams"
          [(selected)]="selected"
        />
        <tx-multiselect
          class="select"
          ariaLabel="Teams"
          placeholder="All teams"
          [options]="teams"
          [ngModel]="selected()"
          (ngModelChange)="selected.set($event ?? [])"
        />
      </div>
      <tx-table ariaLabel="Tasks" dataKey="id" [value]="tasks()" [columns]="columns" />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .tabs {
      flex: 1 1 280px;
    }

    .select {
      width: 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PinnedTabsBasicExample {
  readonly teams = TEAMS;
  readonly selected = signal<readonly string[]>([]);
  readonly columns: TxTableColumn[] = [
    { field: 'task', header: 'Task' },
    { field: 'teamLabel', header: 'Team' },
  ];
  readonly tasks = computed(() =>
    TASKS.filter((item) => !this.selected().length || this.selected().includes(item.team)).map(
      (item) => ({
        ...item,
        teamLabel: TEAMS.find((team) => team.value === item.team)?.label ?? item.team,
      }),
    ),
  );
}
