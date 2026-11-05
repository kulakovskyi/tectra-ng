import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-sizes-example',
  imports: [TxInput],
  template: `
    <div class="stack">
      <input txInput [size]="'small'" placeholder="Small" aria-label="Small" />
      <input txInput placeholder="Medium" aria-label="Medium" />
      <input txInput [size]="'large'" placeholder="Large" aria-label="Large" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputSizesExample {}
