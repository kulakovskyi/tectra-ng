import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-states-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group aria-label="Mailbox">
      <button txButton [icon]="'inbox'" [badge]="unread()" (click)="unread.set(0)">Inbox</button>
      <button txButton [icon]="'refresh'" [loading]="syncing()" (click)="sync()">Sync</button>
      <button txButton [icon]="'pencil'">Compose</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupStatesExample {
  readonly unread = signal(4);
  readonly syncing = signal(false);

  sync(): void {
    this.syncing.set(true);
    setTimeout(() => {
      this.syncing.set(false);
      this.unread.update((count) => count + 2);
    }, 1500);
  }
}
