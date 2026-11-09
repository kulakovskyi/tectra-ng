import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'filters-panel-busy-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxHasFilterValuePipe,
    TxButton,
    TxInput,
    TxLabel,
    TxSelect,
  ],
  template: `
    <tx-filters-panel ariaLabel="Domain filters" [busy]="loading()">
      <div txFilterField="domain" filterLabel="Domain" [filterActive]="domain() | hasFilterValue">
        <tx-label subtle for="busy-domain">Domain</tx-label>
        <input txInput id="busy-domain" placeholder="example.com" [(ngModel)]="domain" />
      </div>
      <div txFilterField="zone" filterLabel="Zone" [filterActive]="zone() | hasFilterValue">
        <tx-label subtle for="busy-zone">Zone</tx-label>
        <tx-select
          inputId="busy-zone"
          placeholder="Any zone"
          showClear
          [options]="zones"
          [(ngModel)]="zone"
        />
      </div>
      <button txButton txFiltersActions icon="refresh" [loading]="loading()" (click)="reload()">
        Reload
      </button>
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelBusyExample {
  readonly zones = [
    { label: '.com', value: 'com' },
    { label: '.org', value: 'org' },
    { label: '.dev', value: 'dev' },
  ];
  readonly domain = signal('');
  readonly zone = signal<string | null>(null);
  readonly loading = signal(false);

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
