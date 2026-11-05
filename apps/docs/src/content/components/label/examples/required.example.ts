import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxLabel } from '@tectra/ui/label';

@Component({
  selector: 'label-required-example',
  imports: [TxLabel, TxInput],
  template: `
    <div class="field">
      <tx-label for="label-required-email" [required]="true" [colon]="true" [tooltip]="'We send the invoice here'">Email</tx-label>
      <input txInput id="label-required-email" type="email" required [fluid]="true" />
    </div>
  `,
  styles: `.field { max-width: 360px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelRequiredExample {}
