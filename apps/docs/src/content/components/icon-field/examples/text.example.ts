import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'icon-field-text-example',
  imports: [TxIconField, TxInputIcon, TxInput],
  template: `
    <div class="stack">
      <tx-icon-field>
        <tx-input-icon>$</tx-input-icon>
        <input txInput placeholder="0.00" aria-label="Amount" />
      </tx-icon-field>
      <tx-icon-field>
        <tx-input-icon>https://</tx-input-icon>
        <input txInput placeholder="example" aria-label="Site" />
        <tx-input-icon position="end">.com</tx-input-icon>
      </tx-icon-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldTextExample {}
