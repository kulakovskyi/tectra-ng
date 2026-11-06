import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-raised-example',
  imports: [TxTabs],
  template: `
    <div class="ground">
      <tx-tabs [raised]="true" [tabs]="tabs" [(value)]="segmented" />
      <tx-tabs variant="pills" [raised]="true" [tabs]="tabs" [(value)]="pills" />
    </div>
  `,
  styles: `
    .ground {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsRaisedExample {
  readonly tabs: TxTabItem[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'archived', label: 'Archived' },
  ];
  readonly segmented = signal<TxTabValue | undefined>('active');
  readonly pills = signal<TxTabValue | undefined>('active');
}
