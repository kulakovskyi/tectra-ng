import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputGroup } from '@tectra-ng/ui/input-group';
import { TxPasswordGenerate } from '@tectra-ng/ui/password-generator';

@Component({
  selector: 'password-generator-icon-button-example',
  imports: [ReactiveFormsModule, TxInputGroup, TxInput, TxButton, TxPasswordGenerate],
  template: `
    <tx-input-group class="group">
      <input
        txInput
        readonly
        aria-label="Recovery key"
        placeholder="No key yet"
        [formControl]="key"
      />
      <button
        txButton
        icon="refresh"
        severity="secondary"
        [txPasswordGenerate]="key"
        [length]="24"
        [symbols]="false"
      ></button>
    </tx-input-group>
  `,
  styles: `
    .group {
      width: 360px;
      max-width: 100%;
      font-family: var(--tx-font-mono);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordGeneratorIconButtonExample {
  readonly key = new FormControl('');
}
