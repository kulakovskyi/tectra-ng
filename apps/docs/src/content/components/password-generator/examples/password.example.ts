import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import { TxPassword } from '@tectra/ui/password';
import { TxPasswordGenerate } from '@tectra/ui/password-generator';

@Component({
  selector: 'password-generator-password-example',
  imports: [ReactiveFormsModule, TxPassword, TxButton, TxPasswordGenerate],
  template: `
    <div class="row">
      <tx-password
        #field
        ariaLabel="New password"
        autocomplete="new-password"
        [toggleMask]="true"
        [feedback]="true"
        [formControl]="password"
      />
      <button
        txButton
        icon="refresh"
        severity="secondary"
        [outlined]="true"
        [txPasswordGenerate]="field"
      >
        Generate
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordGeneratorPasswordExample {
  readonly password = new FormControl('');
}
