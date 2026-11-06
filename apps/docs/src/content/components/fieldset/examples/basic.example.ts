import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFieldset } from '@tectra-ng/ui/fieldset';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'fieldset-basic-example',
  imports: [TxFieldset, TxInput],
  template: `
    <tx-fieldset legend="Contact">
      <div class="fields">
        <input txInput aria-label="Name" placeholder="Name" />
        <input txInput aria-label="Email" placeholder="Email" type="email" />
      </div>
    </tx-fieldset>
  `,
  styles: `
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldsetBasicExample {}
