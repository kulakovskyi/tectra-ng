import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFluid } from '@tectra/core/fluid';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-sizes-example',
  imports: [TxFluid, TxInput],
  template: `
    <tx-fluid class="stack">
      <input txInput [size]="'small'" placeholder="Small" aria-label="Small" />
      <input txInput placeholder="Medium" aria-label="Medium" />
      <input txInput [size]="'large'" placeholder="Large" aria-label="Large" />
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputSizesExample {}
