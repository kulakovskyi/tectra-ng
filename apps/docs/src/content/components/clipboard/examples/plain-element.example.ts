import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxCopy } from '@tectra-ng/utils/clipboard';

@Component({
  selector: 'clipboard-plain-element-example',
  imports: [TxTable, TxTableCell, TxCopy],
  template: `
    <tx-table ariaLabel="Orders" dataKey="id" [value]="orders" [columns]="columns">
      <ng-template txTableCell="id" let-value="value">
        <code class="id" [txCopy]="value" [attr.aria-label]="'Copy ' + value">{{ value }}</code>
      </ng-template>
    </tx-table>
  `,
  styles: `
    .id {
      cursor: copy;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClipboardPlainElementExample {
  readonly orders = [
    { id: 'ORD-1042', client: 'Northwind Studio' },
    { id: 'ORD-1043', client: 'Blue Harbor' },
    { id: 'ORD-1044', client: 'Oakline Partners' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'id', header: 'Order' },
    { field: 'client', header: 'Client' },
  ];
}
