import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-auto-display-example',
  imports: [TxMenubar],
  template: `<tx-menubar ariaLabel="Store" [autoDisplay]="true" [model]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarAutoDisplayExample {
  readonly items: TxMenuItem[] = [
    { label: 'Women', items: [{ label: 'Dresses' }, { label: 'Shoes' }, { label: 'Bags' }] },
    { label: 'Men', items: [{ label: 'Shirts' }, { label: 'Shoes' }] },
    { label: 'Kids', items: [{ label: 'Toys' }, { label: 'Clothes' }] },
  ];
}
