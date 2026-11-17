import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar, avatarInitials, provideTxAvatar } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-app-settings-example',
  imports: [TxAvatar],
  providers: [
    provideTxAvatar({
      initials: (name) =>
        name.includes(' ') ? avatarInitials(name) : name.slice(0, 2).toUpperCase(),
      placeholderImages: ['/assets/blank-avatar.png'],
      tone: 'solid',
    }),
  ],
  template: `
    <div class="row">
      <tx-avatar name="admin" size="large" />
      <tx-avatar name="Olena Kovalenko" size="large" />
      <tx-avatar image="/assets/blank-avatar.png" name="Taras Shevchuk" size="large" />
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
export default class AvatarAppSettingsExample {}
