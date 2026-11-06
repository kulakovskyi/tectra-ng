import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-basic-example',
  imports: [TxTabs],
  template: `
    <tx-tabs [tabs]="tabs" [(value)]="active" (tabChange)="changes.set(changes() + 1)" />
    <p class="status">Active: {{ active() }} · changes: {{ changes() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsBasicExample {
  readonly tabs: TxTabItem[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'settings', label: 'Settings' },
  ];
  readonly active = signal<TxTabValue | undefined>('overview');
  readonly changes = signal(0);
}
