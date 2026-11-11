import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxInput } from '@tectra-ng/ui/input';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { buildHttpParams } from '@tectra-ng/utils/http';

@Component({
  selector: 'http-params-example',
  imports: [FormsModule, TxDatePicker, TxInput, TxMultiselect, TxToggleSwitch],
  template: `
    <div class="stack">
      <input txInput placeholder="Search" aria-label="Search" [(ngModel)]="search" />
      <tx-multiselect
        ariaLabel="Status"
        placeholder="Status"
        [options]="statuses"
        [(ngModel)]="status"
      />
      <tx-datepicker
        ariaLabel="Created after"
        placeholder="Created after"
        [showIcon]="true"
        [(ngModel)]="from"
      />
      <div class="flex">
        <tx-toggle-switch inputId="http-params-archived" [(ngModel)]="archived" />
        <label for="http-params-archived">Archived only</label>
      </div>
      <code class="hint">GET /api/orders?{{ query() }}</code>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HttpParamsExample {
  readonly statuses = ['new', 'paid', 'shipped', 'refunded'];
  readonly search = signal('');
  readonly status = signal<string[]>(['paid', 'shipped']);
  readonly from = signal<Date | null>(null);
  readonly archived = signal(false);
  readonly query = computed(() =>
    buildHttpParams({
      search: this.search(),
      status: this.status(),
      from: this.from(),
      archived: this.archived() || null,
      page: 1,
    }).toString(),
  );
}
