import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxAvatar, TxAvatarGroup } from '@tectra-ng/ui/avatar';

@Component({
  selector: 'avatar-group-example',
  imports: [TxAvatar, TxAvatarGroup],
  template: `
    <div class="list">
      <tx-avatar-group
        [max]="4"
        [addButton]="invitees().length > 0"
        addLabel="Invite"
        ariaLabel="Project members"
        (add)="invite()"
      >
        @for (name of members(); track name) {
          <tx-avatar [name]="name" />
        }
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
  readonly members = signal([
    'Olena Kovalenko',
    'Taras Shevchuk',
    'Iryna Bondar',
    'Maksym Ivanenko',
    'Sofia Melnyk',
    'Andrii Koval',
    'Daria Lysenko',
  ]);
  readonly invitees = signal(['Yurii Hnatiuk', 'Kateryna Savchenko', 'Bohdan Rudenko']);

  invite(): void {
    const [next, ...rest] = this.invitees();
    if (next) {
      this.invitees.set(rest);
      this.members.update((members) => [...members, next]);
    }
  }
}
