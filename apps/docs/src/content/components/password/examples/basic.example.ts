import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxPassword } from '@tectra/ui/password';

@Component({
  selector: 'password-basic-example',
  imports: [FormsModule, TxPassword],
  template: `<tx-password placeholder="Password" ariaLabel="Password" [(ngModel)]="value" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordBasicExample {
  value = '';
}
