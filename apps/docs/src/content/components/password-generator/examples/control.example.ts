import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputCopy } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPasswordGenerate } from '@tectra-ng/ui/password-generator';

@Component({
  selector: 'password-generator-control-example',
  imports: [ReactiveFormsModule, TxInput, TxIconField, TxInputCopy, TxButton, TxPasswordGenerate],
  template: `
    <div class="row">
      <tx-icon-field class="token">
        <input
          txInput
          readonly
          aria-label="API token"
          placeholder="No token yet"
          [formControl]="token"
        />
        <tx-input-copy />
      </tx-icon-field>
      <button
        txButton
        icon="key"
        [txPasswordGenerate]="token"
        [length]="32"
        [symbols]="false"
        [excludeSimilar]="true"
      >
        New token
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .token {
      width: 340px;
      max-width: 100%;
      font-family: var(--tx-font-mono);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordGeneratorControlExample {
  readonly token = new FormControl('');
}
