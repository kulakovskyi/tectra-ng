import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTable, TxTableCell, TxTableColumn } from '@tectra-ng/ui/table';
import { TxTag, TxTagSeverity } from '@tectra-ng/ui/tag';

interface Account {
  id: number;
  name: string;
  plan: string;
  seats: number;
  revenue: number;
  status: 'Active' | 'Trial' | 'Overdue';
}

const SEVERITY: Record<Account['status'], TxTagSeverity> = {
  Active: 'success',
  Trial: 'info',
  Overdue: 'danger',
};

@Component({
  selector: 'docs-landing-table-demo',
  imports: [TxTable, TxTableCell, TxTag],
  template: `
    <tx-table ariaLabel="Accounts" dataKey="id" size="small" [value]="accounts" [columns]="columns">
      <ng-template txTableCell="revenue" let-value="value">{{ '$' + value.toLocaleString('en-US') }}</ng-template>
      <ng-template txTableCell="status" let-row>
        <tx-tag rounded size="small" [severity]="severityOf(row.status)">{{ row.status }}</tx-tag>
      </ng-template>
    </tx-table>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingTableDemo {
  readonly accounts: Account[] = [
    { id: 1, name: 'Northwind Studio', plan: 'Team', seats: 24, revenue: 2880, status: 'Active' },
    { id: 2, name: 'Blue Harbor', plan: 'Starter', seats: 6, revenue: 240, status: 'Trial' },
    {
      id: 3,
      name: 'Oakline Partners',
      plan: 'Business',
      seats: 58,
      revenue: 9860,
      status: 'Active',
    },
    { id: 4, name: 'Silverleaf', plan: 'Team', seats: 12, revenue: 1440, status: 'Overdue' },
    { id: 5, name: 'Granite Works', plan: 'Business', seats: 31, revenue: 5270, status: 'Active' },
    { id: 6, name: 'Maple & Co', plan: 'Starter', seats: 4, revenue: 160, status: 'Trial' },
  ];
  readonly columns: TxTableColumn[] = [
    { field: 'name', header: 'Account', sortable: true, initialWidth: '170px' },
    { field: 'plan', header: 'Plan', sortable: true },
    { field: 'seats', header: 'Seats', sortable: true, align: 'end' },
    { field: 'revenue', header: 'MRR', sortable: true, align: 'end' },
    { field: 'status', header: 'Status' },
  ];

  severityOf(status: Account['status']): TxTagSeverity {
    return SEVERITY[status];
  }
}
