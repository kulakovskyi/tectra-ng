import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-keyboard-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs [tabs]="tabs" [(value)]="manual" />
      <tx-tabs [selectOnFocus]="true" [tabs]="tabs" [(value)]="automatic" />
    </div>
  `,
  styles: `
    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 460px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsKeyboardExample {
  readonly tabs: TxTabItem[] = [
    { value: 'list', label: 'List' },
    { value: 'board', label: 'Board' },
    { value: 'calendar', label: 'Calendar' },
  ];
  readonly manual = signal<TxTabValue | undefined>('list');
  readonly automatic = signal<TxTabValue | undefined>('list');
}
