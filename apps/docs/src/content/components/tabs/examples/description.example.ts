import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-description-example',
  imports: [TxTabs],
  template: `<tx-tabs class="tabs" [tabs]="tabs" [(value)]="active" />`,
  styles: `
    .tabs {
      width: 100%;
      max-width: 460px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsDescriptionExample {
  readonly tabs: TxTabItem[] = [
    { value: 'auto', label: 'Automatic', description: 'Renews every month until you cancel.' },
    { value: 'manual', label: 'Manual', description: 'You pay each invoice yourself.' },
    { value: 'off', label: 'Off', description: 'The plan ends at the end of the period.' },
  ];
  readonly active = signal<TxTabValue | undefined>('auto');
}
