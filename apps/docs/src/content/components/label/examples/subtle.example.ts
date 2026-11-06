import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';

@Component({
  selector: 'label-subtle-example',
  imports: [TxLabel, TxInput],
  template: `
    <div class="filters">
      <div>
        <tx-label for="label-subtle-domain" [subtle]="true">Domain</tx-label>
        <input txInput id="label-subtle-domain" [size]="'small'" [fluid]="true" />
      </div>
      <div>
        <tx-label for="label-subtle-owner" [subtle]="true">Owner</tx-label>
        <input txInput id="label-subtle-owner" [size]="'small'" [fluid]="true" />
      </div>
    </div>
  `,
  styles: `
    .filters {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 220px));
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelSubtleExample {}
