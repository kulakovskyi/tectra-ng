import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-custom-rules-example',
  imports: [TxPassword],
  template: `<tx-password
    [feedback]="true"
    placeholder="Passphrase"
    ariaLabel="Passphrase"
    autocomplete="new-password"
    mediumRegex="^.{12,}$"
    strongRegex="^(?=.*\\s).{20,}$"
    promptLabel="Use a few words"
    weakLabel="Too short — 12+ characters"
    mediumLabel="Good — add more words"
    strongLabel="Great passphrase"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordCustomRulesExample {}
