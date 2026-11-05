import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFloatLabel } from '@tectra/ui/label';
import { TxPassword } from '@tectra/ui/password';

@Component({
  selector: 'password-float-label-example',
  imports: [TxFloatLabel, TxPassword],
  template: `
    <tx-float-label variant="in">
      <tx-password inputId="password-float" [toggleMask]="true" />
      <label for="password-float">Password</label>
    </tx-float-label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordFloatLabelExample {}
