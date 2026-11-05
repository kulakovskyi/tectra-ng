import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';
import { TxInputMask } from '@tectra/ui/input-mask';

@Component({
  selector: 'input-mask-optional-example',
  imports: [FormsModule, TxInput, TxInputMask],
  template: `
    <input
      txInput
      txInputMask="(999) 999-9999? x99999"
      placeholder="Phone with extension"
      aria-label="Phone with extension"
      [(ngModel)]="value"
    />
    <p class="hint">Value: {{ value || '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskOptionalExample {
  value = '';
}
