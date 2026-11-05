import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar, TxAvatarGroup } from '@tectra/ui/avatar';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'avatar-group-example',
  imports: [TxAvatar, TxAvatarGroup, TxButton],
  template: `
    <div class="list">
      <tx-avatar-group [max]="4" ariaLabel="Project members">
        @for (name of members; track name) {
          <tx-avatar [name]="name" />
        }
        <button
          txAvatarGroupEnd
          txButton
          icon="plus"
          size="small"
          severity="secondary"
          [rounded]="true"
          [outlined]="true"
          aria-label="Invite"
        ></button>
      </tx-avatar-group>
      <tx-avatar-group size="small" shape="square" ariaLabel="Teams">
        <tx-avatar name="Design" />
        <tx-avatar name="Growth" />
        <tx-avatar name="Platform" />
      </tx-avatar-group>
    </div>
  `,
  styles: `
    .list {
      display: grid;
      justify-items: start;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AvatarGroupExample {
  readonly members = [
    'Olena Kovalenko',
    'Taras Shevchuk',
    'Iryna Bondar',
    'Maksym Ivanenko',
    'Sofia Melnyk',
    'Andrii Koval',
    'Daria Lysenko',
  ];
}
