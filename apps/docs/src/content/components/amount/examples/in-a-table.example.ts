import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAmount } from '@tectra-ng/ui/amount';

@Component({
  selector: 'amount-in-a-table-example',
  imports: [TxAmount],
  template: `
    <table class="table">
      <caption>
        Orders
      </caption>
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Total</th>
          <th scope="col">Change</th>
        </tr>
      </thead>
      <tbody>
        @for (order of orders; track order.id) {
          <tr>
            <td>{{ order.id }}</td>
            <td><tx-amount [amount]="order.total" currency="USD" format="1.2-2" /></td>
            <td>
              <tx-amount
                [amount]="order.change"
                [signColor]="true"
                [showSign]="true"
                format="1.0-0"
              />
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    caption {
      margin-bottom: 8px;
      text-align: start;
      font-weight: 600;
    }
    th {
      color: var(--tx-text-muted);
      font-weight: 500;
      text-align: start;
    }
    th,
    td {
      padding: 8px 12px 8px 0;
      border-bottom: 1px solid var(--tx-surface-border);
    }
    th:not(:first-child),
    td:not(:first-child) {
      text-align: end;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AmountInATableExample {
  readonly orders = [
    { id: '#1042', total: 1290, change: 4 },
    { id: '#1043', total: 86.5, change: -12 },
    { id: '#1044', total: 12450.75, change: 0 },
  ];
}
