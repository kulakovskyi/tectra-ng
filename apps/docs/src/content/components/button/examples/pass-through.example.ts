import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPassThroughContext } from '@tectra/core/config';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-pass-through-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [icon]="'bell'" [badge]="5" [pt]="decorated">Notifications</button>
      <button txButton [icon]="'refresh'" [loading]="isSyncing()" [pt]="stateAware" (click)="sync()">Sync</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonPassThroughExample {
  isSyncing = signal(false);

  decorated = {
    label: { style: { letterSpacing: '0.08em', textTransform: 'uppercase' } },
    icon: { style: { transform: 'rotate(-15deg)' } },
    badge: { style: { outline: '2px solid white' } },
  };

  stateAware = {
    label: ({ instance }: TxPassThroughContext<TxButton>) => ({
      style: { fontStyle: instance.loading() ? 'italic' : 'normal' },
    }),
  };

  sync(): void {
    this.isSyncing.set(true);
    setTimeout(() => this.isSyncing.set(false), 2000);
  }
}
