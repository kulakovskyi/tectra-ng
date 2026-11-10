import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

interface Redirect {
  id: number;
  from: string;
  to: string;
}

@Component({
  selector: 'truncate-text-table-example',
  imports: [TxTable, TxTableCell, TxTruncateText],
  template: `
    <tx-table ariaLabel="Redirects" dataKey="id" [value]="rows" [columns]="columns">
      <ng-template txTableCell="from" let-value="value">
        <tx-truncate-text [text]="value" [limit]="22" />
      </ng-template>
      <ng-template txTableCell="to" let-value="value">
        <tx-truncate-text [text]="value" [limit]="32" openLink />
      </ng-template>
    </tx-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextTableExample {
  readonly columns: TxTableColumn[] = [
    { field: 'from', header: 'From' },
    { field: 'to', header: 'To' },
  ];
  readonly rows: Redirect[] = [
    {
      id: 1,
      from: '/spring-sale',
      to: 'https://example.com/campaigns/spring-sale-2026?utm_source=newsletter',
    },
    { id: 2, from: '/old-pricing-page-with-a-long-path', to: 'https://example.com/pricing' },
    {
      id: 3,
      from: '/help',
      to: 'https://help.example.com/articles/getting-started-with-your-workspace',
    },
  ];
}
