import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-toggle-mask-example',
  imports: [TxPassword],
  template: `<tx-password [toggleMask]="true" placeholder="Password" ariaLabel="Password" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordToggleMaskExample {}
