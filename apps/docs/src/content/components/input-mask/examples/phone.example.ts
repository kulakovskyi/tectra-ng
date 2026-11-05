import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';
import { TxInputMask } from '@tectra/ui/input-mask';

@Component({
  selector: 'input-mask-phone-example',
  imports: [FormsModule, TxInput, TxInputMask],
  template: `
    <input
      txInput
      txInputMask="+380 (99) 999-99-99"
      placeholder="+380 (__) ___-__-__"
      aria-label="Phone"
      [(ngModel)]="phone"
    />
    <p class="hint">Value: {{ phone || '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskPhoneExample {
  phone = '';
}
