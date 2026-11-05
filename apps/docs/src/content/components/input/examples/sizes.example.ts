import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-sizes-example',
  imports: [TxInput],
  template: `
    <div class="stack">
      <input txInput [size]="'small'" placeholder="Small" />
      <input txInput placeholder="Medium" />
      <input txInput [size]="'large'" placeholder="Large" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputSizesExample {}
