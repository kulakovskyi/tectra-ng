import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxFiltersReset,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'filters-panel-actions-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxFiltersReset,
    TxHasFilterValuePipe,
    TxButton,
    TxDatePicker,
    TxInput,
    TxLabel,
    TxSelect,
    TxTooltip,
  ],
  template: `
    <tx-filters-panel ariaLabel="Invoice filters" (expandedChange)="expanded.set($event)">
      <div txFilterField="number" filterLabel="Number" [filterActive]="number() | hasFilterValue">
        <tx-label subtle for="actions-number">Number</tx-label>
        <input txInput id="actions-number" placeholder="INV-" [(ngModel)]="number" />
      </div>
      <div txFilterField="state" filterLabel="State" [filterActive]="state() | hasFilterValue">
        <tx-label subtle for="actions-state">State</tx-label>
        <tx-select
          inputId="actions-state"
          placeholder="Any state"
          showClear
          [options]="states"
          [(ngModel)]="state"
        />
      </div>
      <div txFilterField="issued" filterLabel="Issued" [filterActive]="issued() | hasFilterValue">
        <tx-label subtle for="actions-issued">Issued</tx-label>
        <tx-datepicker
          inputId="actions-issued"
          selectionMode="range"
          placeholder="Any date"
          showClear
          [(ngModel)]="issued"
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
      <button txButton txFiltersActions icon="plus" (click)="created.set(created() + 1)">
        New invoice
      </button>
    </tx-filters-panel>
    <p class="note">Drafts created: {{ created() }} · panel {{ expanded() ? 'open' : 'closed' }}</p>
  `,
  styles: `
    :host {
      display: block;
    }

    .note {
      margin: 12px 0 0;
    }

    @media (width < 64rem) {
      :host {
        min-height: 400px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelActionsExample {
  readonly states = [
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
    { label: 'Paid', value: 'paid' },
    { label: 'Overdue', value: 'overdue' },
  ];
  readonly number = signal('');
  readonly state = signal<string | null>('sent');
  readonly issued = signal<Date[] | null>(null);
  readonly created = signal(0);
  readonly expanded = signal(false);

  clear(): void {
    this.number.set('');
    this.state.set(null);
    this.issued.set(null);
  }
}
