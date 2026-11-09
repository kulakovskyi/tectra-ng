import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxActionTile } from '@tectra-ng/blocks/action-tile';
import { TxIconName } from '@tectra-ng/icons';
import { TxToastService } from '@tectra-ng/ui/toast';

interface Method {
  id: string;
  icon: TxIconName;
  title: string;
  text: string;
}

@Component({
  selector: 'action-tile-basic-example',
  imports: [TxActionTile],
  template: `
    <div class="methods">
      @for (method of methods; track method.id) {
        <tx-action-tile
          [icon]="method.icon"
          [title]="method.title"
          [text]="method.text"
          [loading]="sending() === method.id"
          [disabled]="!!sending()"
          (tileClick)="choose(method)"
        />
      }
    </div>
  `,
  styles: `
    .methods {
      display: flex;
      flex-direction: column;
      gap: 10.5px;
      width: 100%;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionTileBasicExample {
  private readonly toast = inject(TxToastService);

  readonly sending = signal<string | null>(null);
  readonly methods: Method[] = [
    {
      id: 'email',
      icon: 'envelope',
      title: 'Email a code',
      text: 'We send a one-time code to j***@mail.com',
    },
    {
      id: 'sms',
      icon: 'mobile',
      title: 'Text a code',
      text: 'We send a one-time code to the phone ending in 42',
    },
    {
      id: 'backup',
      icon: 'key',
      title: 'Use a backup code',
      text: 'One of the ten codes you saved when you turned on two-step sign-in',
    },
  ];

  choose(method: Method): void {
    this.sending.set(method.id);
    setTimeout(() => {
      this.sending.set(null);
      this.toast.success(`${method.title}: done`);
    }, 1500);
  }
}
