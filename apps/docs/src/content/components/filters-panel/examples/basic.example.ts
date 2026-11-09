import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxFiltersReset,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

const ORDERS = [
  { id: 1041, customer: 'Olena Koval', status: 'paid', channel: 'web' },
  { id: 1042, customer: 'Mark Ellis', status: 'pending', channel: 'mobile' },
  { id: 1043, customer: 'Ivan Petrenko', status: 'refunded', channel: 'web' },
  { id: 1044, customer: 'Sara Lind', status: 'paid', channel: 'store' },
  { id: 1045, customer: 'Taras Melnyk', status: 'pending', channel: 'store' },
];

@Component({
  selector: 'filters-panel-basic-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxFiltersReset,
    TxHasFilterValuePipe,
    TxButton,
    TxIconField,
    TxInputIcon,
    TxInputClear,
    TxInput,
    TxLabel,
    TxSelect,
    TxTooltip,
  ],
  template: `
    <tx-filters-panel ariaLabel="Order filters">
      <div txFilterField="search" filterLabel="Search" [filterActive]="search() | hasFilterValue">
        <tx-label subtle for="basic-search">Search</tx-label>
        <tx-icon-field>
          <tx-input-icon icon="search" />
          <input
            txInput
            id="basic-search"
            type="search"
            placeholder="Customer"
            [(ngModel)]="search"
          />
          <tx-input-clear />
        </tx-icon-field>
      </div>
      <div txFilterField="status" filterLabel="Status" [filterActive]="status() | hasFilterValue">
        <tx-label subtle for="basic-status">Status</tx-label>
        <tx-select
          inputId="basic-status"
          placeholder="Any status"
          showClear
          [options]="statuses"
          [(ngModel)]="status"
        />
      </div>
      <div
        txFilterField="channel"
        filterLabel="Channel"
        [filterActive]="channel() | hasFilterValue"
      >
        <tx-label subtle for="basic-channel">Channel</tx-label>
        <tx-select
          inputId="basic-channel"
          placeholder="Any channel"
          showClear
          [options]="channels"
          [(ngModel)]="channel"
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
    </tx-filters-panel>
    <p class="note">{{ found().length }} of {{ orders.length }} orders</p>
  `,
  styles: `
    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelBasicExample {
  readonly orders = ORDERS;
  readonly statuses = [
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Refunded', value: 'refunded' },
  ];
  readonly channels = [
    { label: 'Web', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Store', value: 'store' },
  ];
  readonly search = signal('');
  readonly status = signal<string | null>(null);
  readonly channel = signal<string | null>(null);
  readonly found = computed(() =>
    ORDERS.filter(
      (order) =>
        order.customer.toLowerCase().includes(this.search().trim().toLowerCase()) &&
        (!this.status() || order.status === this.status()) &&
        (!this.channel() || order.channel === this.channel()),
    ),
  );

  clear(): void {
    this.search.set('');
    this.status.set(null);
    this.channel.set(null);
  }
}
