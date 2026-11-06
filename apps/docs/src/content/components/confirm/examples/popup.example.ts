import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxConfirmService } from '@tectra-ng/ui/confirm';

@Component({
  selector: 'confirm-popup-example',
  imports: [TxButton, TxAvatar],
  template: `
    <ul class="members">
      @for (member of members(); track member) {
        <li>
          <tx-avatar size="small" [name]="member" />
          <span class="name">{{ member }}</span>
          <button
            txButton
            size="small"
            severity="secondary"
            [text]="true"
            [attr.aria-label]="'Remove ' + member"
            (click)="remove($event, member)"
          >
            Remove
          </button>
        </li>
      }
    </ul>
  `,
  styles: `
    .members {
      display: grid;
      gap: 6px;
      max-width: 320px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .members li {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .name {
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmPopupExample {
  private confirm = inject(TxConfirmService);
  readonly members = signal(['Olena Koval', 'Marek Nowak', 'Sara Lind']);

  async remove(event: Event, member: string): Promise<void> {
    const ok = await this.confirm.popup(event, {
      message: `Remove ${member} from the team?`,
      severity: 'danger',
      acceptLabel: 'Remove',
      placement: 'left',
    });
    if (ok) {
      this.members.update((members) => members.filter((other) => other !== member));
    }
  }
}
