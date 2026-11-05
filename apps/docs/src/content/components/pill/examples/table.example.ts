import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill, TxPillTone } from '@tectra/ui/pill';

@Component({
  selector: 'pill-table-example',
  imports: [TxPill],
  template: `
    <table class="table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Status</th>
          <th>Plan</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows; track row.domain) {
          <tr>
            <td>{{ row.domain }}</td>
            <td>
              <tx-pill size="small" [tone]="row.tone" [dot]="true">{{ row.status }}</tx-pill>
            </td>
            <td>
              <tx-pill size="small" variant="outline">{{ row.plan }}</tx-pill>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    .table {
      width: 100%;
      max-width: 520px;
      border-collapse: collapse;
      font-size: 13px;
    }

    th {
      color: var(--tx-text-muted);
      font-weight: 600;
      text-align: left;
    }

    th,
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--tx-surface-border);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillTableExample {
  readonly rows: { domain: string; status: string; tone: TxPillTone; plan: string }[] = [
    { domain: 'shop.example.com', status: 'Live', tone: 'success', plan: 'Team' },
    { domain: 'docs.example.com', status: 'Pending DNS', tone: 'warn', plan: 'Free' },
    { domain: 'old.example.com', status: 'Expired', tone: 'danger', plan: 'Team' },
  ];
}
