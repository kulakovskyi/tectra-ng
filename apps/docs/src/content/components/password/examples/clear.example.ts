import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxPassword } from '@tectra/ui/password';

@Component({
  selector: 'password-clear-example',
  imports: [FormsModule, TxPassword],
  template: `<tx-password
    [showClear]="true"
    [toggleMask]="true"
    ariaLabel="Password"
    [(ngModel)]="value"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordClearExample {
  value = 'correct horse';
}
