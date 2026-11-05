import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxIftaLabel } from '@tectra/ui/label';

@Component({
  selector: 'label-ifta-example',
  imports: [TxIftaLabel, TxInput],
  template: `
    <div class="row">
      <tx-ifta-label>
        <input txInput id="ifta-amount" [fluid]="true" value="1 250" />
        <label for="ifta-amount">Amount, USD</label>
      </tx-ifta-label>
      <tx-ifta-label>
        <input txInput id="ifta-note" [fluid]="true" [variant]="'filled'" placeholder="Optional" />
        <label for="ifta-note">Note</label>
      </tx-ifta-label>
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 260px));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelIftaExample {}
