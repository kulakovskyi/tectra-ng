import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputMask } from '@tectra-ng/ui/input-mask';

@Component({
  selector: 'input-mask-auto-clear-example',
  imports: [TxInput, TxInputMask],
  template: `
    <div class="row">
      <input
        txInput
        txInputMask="9999-9999"
        placeholder="Clears when incomplete"
        aria-label="Clears when incomplete"
      />
      <input
        txInput
        txInputMask="9999-9999"
        [autoClear]="false"
        placeholder="Keeps partial input"
        aria-label="Keeps partial input"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskAutoClearExample {}
