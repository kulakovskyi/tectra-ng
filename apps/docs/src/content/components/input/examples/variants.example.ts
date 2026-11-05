import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-variants-example',
  imports: [TxInput],
  template: `
    <div class="stack">
      <input txInput placeholder="Outlined" aria-label="Outlined" />
      <input txInput [variant]="'filled'" placeholder="Filled" aria-label="Filled" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputVariantsExample {}
