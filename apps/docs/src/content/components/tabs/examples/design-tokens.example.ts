import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-design-tokens-example',
  imports: [TxTabs],
  template: `
    <tx-tabs
      class="tabs"
      [tabs]="tabs"
      [(value)]="active"
      [dt]="{
        segmented: {
          borderRadius: '999px',
          tab: {
            borderRadius: '999px',
            activeBackground: 'var(--tx-success-base)',
            activeColor: 'var(--tx-success-contrast)',
          },
        },
      }"
    />
  `,
  styles: `
    .tabs {
      width: 100%;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsDesignTokensExample {
  readonly tabs: TxTabItem[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];
  readonly active = signal<TxTabValue | undefined>('yearly');
}
