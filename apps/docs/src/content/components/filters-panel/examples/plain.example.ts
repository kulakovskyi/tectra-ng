import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxCard } from '@tectra-ng/ui/card';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'filters-panel-plain-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxHasFilterValuePipe,
    TxCard,
    TxInput,
    TxLabel,
    TxSelect,
  ],
  template: `
    <tx-card title="Team members" subtitle="People with access to the workspace">
      <tx-filters-panel variant="plain" ariaLabel="Member filters">
        <div txFilterField="name" filterLabel="Name" [filterActive]="name() | hasFilterValue">
          <tx-label subtle for="plain-name">Name</tx-label>
          <input txInput id="plain-name" placeholder="Name or email" [(ngModel)]="name" />
        </div>
        <div txFilterField="role" filterLabel="Role" [filterActive]="role() | hasFilterValue">
          <tx-label subtle for="plain-role">Role</tx-label>
          <tx-select
            inputId="plain-role"
            placeholder="Any role"
            showClear
            [options]="roles"
            [(ngModel)]="role"
          />
        </div>
      </tx-filters-panel>
    </tx-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelPlainExample {
  readonly roles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ];
  readonly name = signal('');
  readonly role = signal<string | null>(null);
}
