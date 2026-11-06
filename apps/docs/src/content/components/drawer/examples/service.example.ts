import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxDialogClose,
  TxDialogContent,
  TxDialogFooter,
  TxDialogHeader,
  TxDialogService,
  injectDialogData,
} from '@tectra-ng/ui/dialog';

interface Order {
  id: string;
  customer: string;
  total: number;
  items: string[];
}

@Component({
  selector: 'drawer-order-details',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose, TxButton, TxAmount],
  template: `
    <tx-dialog-header [title]="'Order ' + order.id" [subtitle]="order.customer" />
    <tx-dialog-content>
      <ul class="items">
        @for (item of order.items; track item) {
          <li>{{ item }}</li>
        }
      </ul>
      <p>Total: <tx-amount currency="USD" [amount]="order.total" [strong]="true" /></p>
    </tx-dialog-content>
    <tx-dialog-footer>
      <button txButton severity="secondary" txDialogClose>Close</button>
      <button txButton [txDialogClose]="'refund'">Refund</button>
    </tx-dialog-footer>
  `,
  styles: `
    .items {
      margin: 0 0 12px;
      padding-inline-start: 18px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailsDrawer {
  readonly order = injectDialogData<Order>();
}

@Component({
  selector: 'drawer-service-example',
  imports: [TxButton],
  template: `
    <ul class="orders">
      @for (order of orders; track order.id) {
        <li>
          <button txButton severity="secondary" [text]="true" (click)="open(order)">
            {{ order.id }} · {{ order.customer }}
          </button>
        </li>
      }
    </ul>
  `,
  styles: `
    .orders {
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DrawerServiceExample {
  private dialogs = inject(TxDialogService);
  readonly orders: Order[] = [
    {
      id: '#1042',
      customer: 'Olena Koval',
      total: 128,
      items: ['Desk lamp', 'Notebook × 2'],
    },
    { id: '#1043', customer: 'Marek Nowak', total: 54, items: ['Mug', 'Coffee beans'] },
  ];

  open(order: Order): void {
    this.dialogs.open(OrderDetailsDrawer, { data: order, drawer: 'right', drawerSize: 'medium' });
  }
}
