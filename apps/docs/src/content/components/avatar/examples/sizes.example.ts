import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-sizes-example',
  imports: [TxAvatar],
  template: `
    <div class="row">
      <tx-avatar name="Olena Kovalenko" size="small" />
      <tx-avatar name="Olena Kovalenko" />
      <tx-avatar name="Olena Kovalenko" size="large" />
      <tx-avatar name="Olena Kovalenko" size="xlarge" />
      <tx-avatar name="Olena Kovalenko" [size]="96" />
      <div class="box">
        <tx-avatar name="Olena Kovalenko" size="fill" />
      </div>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .box {
      width: 120px;
      height: 120px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarSizesExample {}
