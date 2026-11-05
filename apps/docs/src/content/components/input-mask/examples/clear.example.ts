import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra/ui/icon-field';
import { TxInput } from '@tectra/ui/input';
import { TxInputMask } from '@tectra/ui/input-mask';

@Component({
  selector: 'input-mask-clear-example',
  imports: [ReactiveFormsModule, TxIconField, TxInputIcon, TxInputClear, TxInput, TxInputMask],
  template: `
    <tx-icon-field>
      <tx-input-icon icon="phone" />
      <input txInput txInputMask="(999) 999-9999" aria-label="Phone" [formControl]="phone" />
      <tx-input-clear />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskClearExample {
  readonly phone = new FormControl('0501234567');
}
