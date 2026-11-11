import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxDebounceInput } from '@tectra-ng/utils/debounce-input';

@Component({
  selector: 'debounce-input-icon-field-example',
  imports: [TxIconField, TxInputIcon, TxInput, TxDebounceInput],
  template: `
    <div class="stack">
      <tx-icon-field txDebounceInput [debounceTime]="400" (debounceValue)="query.set($event)">
        <tx-input-icon [icon]="'search'" />
        <input txInput placeholder="Search orders" aria-label="Search orders" />
      </tx-icon-field>
      <span class="hint">Query: {{ query() || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DebounceInputIconFieldExample {
  readonly query = signal('');
}
