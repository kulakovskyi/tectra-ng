import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-disabled-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs [tabs]="tabs" [(value)]="segmented" />
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
export default class TabsDisabledExample {
  readonly tabs: TxTabItem[] = [
    { value: 'general', label: 'General' },
    { value: 'billing', label: 'Billing', disabled: true },
    { value: 'api', label: 'API keys' },
  ];
  readonly segmented = signal<TxTabValue | undefined>('general');
  readonly line = signal<TxTabValue | undefined>('general');
}
