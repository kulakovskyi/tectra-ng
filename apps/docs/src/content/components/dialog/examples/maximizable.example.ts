import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialog } from '@tectra-ng/ui/dialog';

@Component({
  selector: 'dialog-maximizable-example',
  imports: [TxDialog, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="visible.set(true)">
      Open report
    </button>
    <tx-dialog
      header="Monthly report"
      subtitle="Drag the header to move it"
      size="large"
      draggable
      maximizable
      [modal]="false"
      [(visible)]="visible"
    >
      <table class="report">
        <thead>
          <tr>
            <th>Month</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.month) {
            <tr>
              <td>{{ row.month }}</td>
              <td>{{ row.orders }}</td>
              <td>{{ row.revenue }}</td>
            </tr>
          }
        </tbody>
      </table>
    </tx-dialog>
  `,
  styles: `
    .report {
      width: 100%;
      border-collapse: collapse;
    }
    .report th,
    .report td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--tx-surface-border);
      text-align: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogMaximizableExample {
  readonly visible = signal(false);
  readonly rows = [
    { month: 'August', orders: 1204, revenue: '48 200 USD' },
    { month: 'September', orders: 1388, revenue: '55 900 USD' },
    { month: 'October', orders: 1512, revenue: '61 300 USD' },
  ];
}
