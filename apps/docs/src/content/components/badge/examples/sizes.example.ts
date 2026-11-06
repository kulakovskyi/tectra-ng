import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBadge } from '@tectra-ng/ui/badge';

@Component({
  selector: 'badge-sizes-example',
  imports: [TxBadge],
  template: `
    <div class="flex">
      <tx-badge [value]="8" [size]="'small'" />
      <tx-badge [value]="8" />
      <tx-badge [value]="8" [size]="'large'" />
      <tx-badge [value]="8" [size]="'xlarge'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeSizesExample {}
