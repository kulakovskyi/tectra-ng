import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-basic-example',
  imports: [FormsModule, TxCheckbox],
  template: `
    <tx-checkbox label="Remember me on this device" [(ngModel)]="remember" />
    <p class="hint">Value: {{ remember }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxBasicExample {
  remember = true;
}
