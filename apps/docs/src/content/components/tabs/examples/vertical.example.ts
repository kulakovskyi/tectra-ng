import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-vertical-example',
  imports: [TxTabs],
  template: `
    <div class="layout">
      <tx-tabs class="menu" orientation="vertical" [tabs]="tabs" [(value)]="active" />
      <div class="content">
        @switch (active()) {
          @case ('profile') {
            Name, photo and contact email.
          }
          @case ('security') {
            Password, sessions and two-factor sign-in.
          }
          @default {
            Email and push notifications.
          }
        }
      </div>
    </div>
  `,
  styles: `
    .layout {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .menu {
      width: 200px;
    }
    .content {
      flex: 1;
      min-width: 200px;
      font-size: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsVerticalExample {
  readonly tabs: TxTabItem[] = [
    { value: 'profile', label: 'Profile', icon: 'user' },
    { value: 'security', label: 'Security', icon: 'lock' },
    { value: 'notifications', label: 'Notifications', icon: 'bell' },
  ];
  readonly active = signal<TxTabValue | undefined>('profile');
}
