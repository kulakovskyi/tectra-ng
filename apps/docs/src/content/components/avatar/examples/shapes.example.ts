import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-shapes-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      <tx-avatar name="Design Team" shape="square" size="large" />
      <tx-avatar name="Mobile App" shape="square" size="large" />
      <tx-avatar icon="briefcase" shape="square" size="large" ariaLabel="Workspace" />
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
export default class AvatarShapesExample {}
