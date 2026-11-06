import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'field-basic-example',
  imports: [TxField, TxInput],
  template: `
    <div class="form">
      <tx-field label="Workspace name" hint="Shown in the sidebar and in invites.">
        <input txInput [fluid]="true" />
      </tx-field>
    </div>
  `,
  styles: `
    .form {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldBasicExample {}
