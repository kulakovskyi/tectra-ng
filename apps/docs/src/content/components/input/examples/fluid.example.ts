import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'input-fluid-example',
  imports: [TxInput],
  template: `
    <div class="stack">
      <input txInput placeholder="Default width" aria-label="Default width" />
      <input txInput [fluid]="true" placeholder="Fluid" aria-label="Fluid" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputFluidExample {}
