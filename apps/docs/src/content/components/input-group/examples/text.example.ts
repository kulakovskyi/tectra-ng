import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputGroup, TxInputGroupAddon } from '@tectra-ng/ui/input-group';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-group-text-example',
  imports: [TxInputGroup, TxInputGroupAddon, TxInput, TxInputNumber],
  template: `
    <div class="stack">
      <tx-input-group>
        <tx-input-group-addon>https://</tx-input-group-addon>
        <input txInput placeholder="site" aria-label="Site" />
        <tx-input-group-addon>.com</tx-input-group-addon>
      </tx-input-group>
      <tx-input-group>
        <tx-input-group-addon>$</tx-input-group-addon>
        <tx-input-number placeholder="Price" ariaLabel="Price" [maxFractionDigits]="0" />
        <tx-input-group-addon>.00</tx-input-group-addon>
      </tx-input-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputGroupTextExample {}
