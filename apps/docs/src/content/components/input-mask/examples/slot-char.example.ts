import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxInputMask } from '@tectra/ui/input-mask';

@Component({
  selector: 'input-mask-slot-char-example',
  imports: [TxInput, TxInputMask],
  template: `
    <div class="row">
      <input
        txInput
        txInputMask="999-999"
        slotChar="#"
        placeholder="Hash slots"
        aria-label="Hash slots"
      />
      <input txInput txInputMask="99:99" slotChar="·" placeholder="Time" aria-label="Time" />
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
export default class InputMaskSlotCharExample {}
