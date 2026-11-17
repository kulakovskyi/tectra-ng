import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxKeyFilter } from '@tectra-ng/ui/key-filter';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'key-filter-switch-off-example',
  imports: [FormsModule, TxInput, TxKeyFilter, TxToggleSwitch],
  template: `
    <div class="stack">
      <tx-toggle-switch label="Latin letters only" [(ngModel)]="latinOnly" />
      <input
        txInput
        [txKeyFilter]="latinOnly() ? 'latin' : null"
        keyFilterExtra=" "
        placeholder="Full name"
        aria-label="Full name"
      />
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      justify-items: start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KeyFilterSwitchOffExample {
  readonly latinOnly = signal(true);
}
