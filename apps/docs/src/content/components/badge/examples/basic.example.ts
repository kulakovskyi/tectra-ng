import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBadge } from '@tectra/ui/badge';

@Component({
  selector: 'badge-basic-example',
  imports: [TxBadge],
  template: `
    <div class="flex">
      <tx-badge [value]="2" />
      <tx-badge [value]="'new'" />
      <tx-badge [value]="128" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeBasicExample {}
