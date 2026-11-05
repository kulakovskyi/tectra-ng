import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxLabel } from '@tectra/ui/label';

@Component({
  selector: 'label-basic-example',
  imports: [TxLabel, TxInput],
  template: `
    <div class="field">
      <tx-label for="label-basic-name">Full name</tx-label>
      <input txInput id="label-basic-name" [fluid]="true" />
    </div>
  `,
  styles: `.field { max-width: 360px; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelBasicExample {}
