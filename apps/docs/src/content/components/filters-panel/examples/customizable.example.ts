import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxFiltersPanelLayout,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'filters-panel-customizable-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxHasFilterValuePipe,
    TxButton,
    TxInput,
    TxLabel,
    TxMultiselect,
    TxSelect,
  ],
  template: `
    <tx-filters-panel
      #panel
      ariaLabel="Ticket filters"
      stateKey="docs-filters-panel-tickets"
      [defaultVisible]="3"
      (layoutChange)="layout.set($event)"
    >
      <div txFilterField="search" filterLabel="Search" [filterActive]="search() | hasFilterValue">
        <tx-label subtle for="custom-search">Search</tx-label>
        <input txInput id="custom-search" placeholder="Subject" [(ngModel)]="search" />
      </div>
      <div txFilterField="status" filterLabel="Status" [filterActive]="status() | hasFilterValue">
        <tx-label subtle for="custom-status">Status</tx-label>
        <tx-multiselect
          inputId="custom-status"
          placeholder="Any status"
          [options]="statuses"
          [(ngModel)]="status"
        />
      </div>
      <div
        txFilterField="priority"
        filterLabel="Priority"
        [filterActive]="priority() | hasFilterValue"
      >
        <tx-label subtle for="custom-priority">Priority</tx-label>
        <tx-select
          inputId="custom-priority"
          placeholder="Any priority"
          showClear
          [options]="priorities"
          [(ngModel)]="priority"
        />
      </div>
      <div
        txFilterField="assignee"
        filterLabel="Assignee"
        [filterActive]="assignee() | hasFilterValue"
      >
        <tx-label subtle for="custom-assignee">Assignee</tx-label>
        <tx-select
          inputId="custom-assignee"
          placeholder="Anyone"
          showClear
          [options]="people"
          [(ngModel)]="assignee"
        />
      </div>
      <div txFilterField="team" filterLabel="Team" [filterActive]="team() | hasFilterValue">
        <tx-label subtle for="custom-team">Team</tx-label>
        <tx-select
          inputId="custom-team"
          placeholder="Any team"
          showClear
          [options]="teams"
          [(ngModel)]="team"
        />
      </div>
      <div txFilterField="tag" filterLabel="Tag" [filterActive]="tag() | hasFilterValue">
        <tx-label subtle for="custom-tag">Tag</tx-label>
        <input txInput id="custom-tag" placeholder="billing, login…" [(ngModel)]="tag" />
      </div>
    </tx-filters-panel>
    <div class="row">
      <button txButton severity="secondary" outlined size="small" (click)="panel.reset()">
        Reset layout
      </button>
      <span class="note"
        >Saved: {{ layout() ? (layout()!.visible ?? []).join(', ') : 'default' }}</span
      >
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelCustomizableExample {
  readonly layout = signal<TxFiltersPanelLayout | null>(null);
  readonly statuses = [
    { label: 'Open', value: 'open' },
    { label: 'In progress', value: 'progress' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Closed', value: 'closed' },
  ];
  readonly priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Normal', value: 'normal' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' },
  ];
  readonly people = [
    { label: 'Anna Shevchenko', value: 'anna' },
    { label: 'Leo Brandt', value: 'leo' },
    { label: 'Maria Bondar', value: 'maria' },
  ];
  readonly teams = [
    { label: 'Billing', value: 'billing' },
    { label: 'Support', value: 'support' },
    { label: 'Platform', value: 'platform' },
  ];
  readonly search = signal('');
  readonly status = signal<string[]>(['open']);
  readonly priority = signal<string | null>(null);
  readonly assignee = signal<string | null>(null);
  readonly team = signal<string | null>(null);
  readonly tag = signal('');
}
