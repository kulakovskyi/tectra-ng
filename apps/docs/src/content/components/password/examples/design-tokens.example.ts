import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-design-tokens-example',
  imports: [TxPassword],
  template: `<tx-password
    [feedback]="true"
    placeholder="Focus and type"
    ariaLabel="Password"
    autocomplete="new-password"
    [dt]="tokens"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordDesignTokensExample {
  readonly tokens = { meter: { height: '10px', strongBackground: '#0f766e' } };
}
