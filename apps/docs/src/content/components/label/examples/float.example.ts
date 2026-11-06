import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxFloatLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'label-float-example',
  imports: [TxFloatLabel, TxInput],
  template: `
    <div class="row">
      <tx-float-label>
        <input txInput id="float-over" [fluid]="true" />
        <label for="float-over">Over</label>
      </tx-float-label>
      <tx-float-label [variant]="'in'">
        <input txInput id="float-in" [fluid]="true" value="Has a value" />
        <label for="float-in">In</label>
      </tx-float-label>
      <tx-float-label [variant]="'on'">
        <input txInput id="float-on" [fluid]="true" />
        <label for="float-on">On</label>
      </tx-float-label>
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      padding-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelFloatExample {}
