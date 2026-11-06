import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-icons-and-counters-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs [tabs]="tabs" [(value)]="segmented" />
      <tx-tabs variant="pills" [tabs]="tabs" [(value)]="pills" />
      <tx-tabs variant="line" [tabs]="tabs" [(value)]="line" />
    </div>
  `,
  styles: `
    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsIconsAndCountersExample {
  readonly tabs: TxTabItem[] = [
    { value: 'inbox', label: 'Inbox', icon: 'inbox', badge: 12, tooltip: 'Unread messages' },
    { value: 'starred', label: 'Starred', icon: 'star', badge: 3 },
    { value: 'drafts', label: 'Drafts', icon: 'file-edit', badge: 0 },
    { value: 'sent', label: 'Sent', icon: 'send' },
  ];
  readonly segmented = signal<TxTabValue | undefined>('inbox');
  readonly pills = signal<TxTabValue | undefined>('inbox');
  readonly line = signal<TxTabValue | undefined>('inbox');
}
