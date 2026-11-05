import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar, TxAvatarGroup } from '@tectra/ui/avatar';

@Component({
  selector: 'avatar-design-tokens-example',
  imports: [TxAvatar, TxAvatarGroup],
  template: `
    <tx-avatar-group
      size="large"
      ariaLabel="Reviewers"
      [dt]="{ group: { overlap: '0.4', ringWidth: '3px' } }"
    >
      <tx-avatar name="Olena Kovalenko" />
      <tx-avatar name="Taras Shevchuk" />
      <tx-avatar name="Iryna Bondar" />
    </tx-avatar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarDesignTokensExample {}
