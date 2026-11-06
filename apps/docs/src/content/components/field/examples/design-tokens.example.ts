import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'field-design-tokens-example',
  imports: [TxField, TxInput],
  template: `
    <div class="form">
      <tx-field label="City" layout="horizontal" [dt]="tokens">
        <input txInput [fluid]="true" />
      </tx-field>
      <tx-field label="Postal code" layout="horizontal" [dt]="tokens">
        <input txInput [fluid]="true" />
      </tx-field>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
      max-width: 480px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldDesignTokensExample {
  readonly tokens = { horizontal: { labelWidth: '110px', columnGap: '12px' } };
}
