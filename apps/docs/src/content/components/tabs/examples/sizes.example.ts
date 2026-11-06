import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';

@Component({
  selector: 'tabs-sizes-example',
  imports: [TxTabs],
  template: `
    <div class="column">
      <tx-tabs size="small" [tabs]="tabs" [(value)]="small" />
      <tx-tabs size="medium" [tabs]="tabs" [(value)]="medium" />
    </div>
  `,
  styles: `
    .column {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TabsSizesExample {
  readonly tabs: TxTabItem[] = [
    { value: 'table', label: 'Table', icon: 'table' },
    { value: 'cards', label: 'Cards', icon: 'th-large' },
    { value: 'chart', label: 'Chart', icon: 'chart-bar' },
  ];
  readonly small = signal<TxTabValue | undefined>('table');
  readonly medium = signal<TxTabValue | undefined>('table');
}
