import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxDivider } from '@tectra-ng/ui/divider';

@Component({
  selector: 'divider-basic-example',
  imports: [TxDivider],
  template: `
    <p>Invoices are sent on the first day of every month.</p>
    <tx-divider />
    <p>Unpaid invoices are reminded about after seven days.</p>
  `,
  styles: `
    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DividerBasicExample {}
