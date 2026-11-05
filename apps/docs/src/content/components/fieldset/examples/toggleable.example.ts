import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxFieldset } from '@tectra/ui/fieldset';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'fieldset-toggleable-example',
  imports: [TxFieldset, TxInput],
  template: `
    <tx-fieldset legend="Billing address" [toggleable]="true" [(collapsed)]="collapsed">
      <div class="fields">
        <input txInput aria-label="Street" placeholder="Street" />
        <input txInput aria-label="City" placeholder="City" />
      </div>
    </tx-fieldset>
    <p class="status">{{ collapsed() ? 'Collapsed' : 'Expanded' }}</p>
  `,
  styles: `
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldsetToggleableExample {
  readonly collapsed = signal(false);
}
