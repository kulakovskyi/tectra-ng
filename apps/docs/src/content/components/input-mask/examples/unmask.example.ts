import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputMask } from '@tectra-ng/ui/input-mask';

@Component({
  selector: 'input-mask-unmask-example',
  imports: [ReactiveFormsModule, TxInput, TxInputMask],
  template: `
    <input
      txInput
      txInputMask="99-999-999"
      [unmask]="true"
      aria-label="Tax number"
      [formControl]="code"
    />
    <p class="hint">Model: {{ code.value || '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskUnmaskExample {
  readonly code = new FormControl('12345678');
}
