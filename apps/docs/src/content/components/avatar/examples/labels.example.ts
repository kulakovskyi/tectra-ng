import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-labels-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      <tx-avatar label="AI" tone="purple" ariaLabel="Assistant" />
      <tx-avatar icon="globe" tone="sky" ariaLabel="Public link" />
      <tx-avatar icon="shield" tone="green" ariaLabel="Verified" />
      <tx-avatar label="99+" tone="red" ariaLabel="99 or more" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarLabelsExample {}
