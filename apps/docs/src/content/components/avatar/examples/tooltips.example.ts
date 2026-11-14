import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar, TxAvatarGroup } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-tooltips-example',
  imports: [TxAvatar, TxAvatarGroup],
  template: `
    <div class="row">
      <tx-avatar-group ariaLabel="Reviewers">
        <tx-avatar name="Olena Kovalenko" />
        <tx-avatar name="Taras Shevchuk" />
        <tx-avatar name="Iryna Bondar" />
      </tx-avatar-group>
      <tx-avatar-group [tooltips]="false" ariaLabel="Watchers">
        <tx-avatar name="Maksym Ivanenko" />
        <tx-avatar name="Sofia Melnyk" />
      </tx-avatar-group>
      <tx-avatar name="Andrii Koval" size="large" tooltip tooltipPlacement="right" />
      <tx-avatar name="Oksana Lysenko" size="large" tooltip="none" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarTooltipsExample {}
