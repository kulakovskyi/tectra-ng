import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFluid } from '@tectra/core/fluid';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-variants-example',
  imports: [TxFluid, TxInput],
  template: `
    <tx-fluid class="stack">
      <input txInput placeholder="Outlined" aria-label="Outlined" />
      <input txInput [variant]="'filled'" placeholder="Filled" aria-label="Filled" />
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputVariantsExample {}
