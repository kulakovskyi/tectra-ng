import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-multiple-example',
  imports: [TxPanelMenu],
  template: `<tx-panel-menu class="menu" [multiple]="true" [model]="items" />`,
  styles: `
    .menu {
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuMultipleExample {
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Sales',
      icon: 'chart-line',
      items: [{ label: 'Orders' }, { label: 'Refunds' }],
    },
    {
      label: 'Customers',
      icon: 'users',
      items: [{ label: 'Accounts' }, { label: 'Segments' }],
    },
    {
      label: 'Products',
      icon: 'box',
      items: [{ label: 'Catalog' }, { label: 'Prices' }],
    },
  ];
}
