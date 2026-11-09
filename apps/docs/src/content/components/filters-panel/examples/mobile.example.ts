import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxFiltersReset,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'filters-panel-mobile-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxFiltersReset,
    TxHasFilterValuePipe,
    TxButton,
    TxInput,
    TxLabel,
    TxMultiselect,
    TxSelect,
    TxTooltip,
  ],
  template: `
    <div class="phone">
      <tx-filters-panel collapse="always" ariaLabel="Task filters">
        <div txFilterField="search" filterLabel="Search" [filterActive]="search() | hasFilterValue">
          <tx-label subtle for="mobile-search">Search</tx-label>
          <input txInput id="mobile-search" placeholder="Task name" [(ngModel)]="search" />
        </div>
        <div txFilterField="status" filterLabel="Status" [filterActive]="status() | hasFilterValue">
          <tx-label subtle for="mobile-status">Status</tx-label>
          <tx-multiselect
            inputId="mobile-status"
            placeholder="Any status"
            [options]="statuses"
            [(ngModel)]="status"
          />
        </div>
        <div txFilterField="owner" filterLabel="Owner" [filterActive]="owner() | hasFilterValue">
          <tx-label subtle for="mobile-owner">Owner</tx-label>
          <tx-select
            inputId="mobile-owner"
            placeholder="Anyone"
            showClear
            [options]="people"
            [(ngModel)]="owner"
          />
        </div>
        <div
          txFilterField="project"
          filterLabel="Project"
          [filterActive]="project() | hasFilterValue"
        >
          <tx-label subtle for="mobile-project">Project</tx-label>
          <tx-select
            inputId="mobile-project"
            placeholder="Any project"
            showClear
            [options]="projects"
            [(ngModel)]="project"
          />
        </div>
        <button
          txButton
          txFiltersActions
          txFiltersReset
          icon="filter-slash"
          severity="warn"
          aria-label="Clear filters"
          txTooltip="Clear filters"
          (click)="clear()"
        ></button>
        <button
          txButton
          txFiltersActions
          icon="plus"
          aria-label="New task"
          txTooltip="New task"
        ></button>
      </tx-filters-panel>
    </div>
  `,
  styles: `
    .phone {
      box-sizing: border-box;
      max-width: 375px;
      min-height: 470px;
      margin-inline: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelMobileExample {
  readonly statuses = [
    { label: 'To do', value: 'todo' },
    { label: 'In progress', value: 'progress' },
    { label: 'Review', value: 'review' },
    { label: 'Done', value: 'done' },
  ];
  readonly people = [
    { label: 'Anna Shevchenko', value: 'anna' },
    { label: 'Leo Brandt', value: 'leo' },
  ];
  readonly projects = [
    { label: 'Website', value: 'web' },
    { label: 'Mobile app', value: 'app' },
  ];
  readonly search = signal('');
  readonly status = signal<string[]>(['todo', 'progress']);
  readonly owner = signal<string | null>('anna');
  readonly project = signal<string | null>(null);

  clear(): void {
    this.search.set('');
    this.status.set([]);
    this.owner.set(null);
    this.project.set(null);
  }
}
