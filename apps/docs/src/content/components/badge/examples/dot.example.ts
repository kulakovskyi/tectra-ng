import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBadge } from '@tectra-ng/ui/badge';

@Component({
  selector: 'badge-dot-example',
  imports: [TxBadge],
  template: `
    <div class="flex">
      <tx-badge />
      <tx-badge [severity]="'success'" />
      <tx-badge [severity]="'danger'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeDotExample {}
