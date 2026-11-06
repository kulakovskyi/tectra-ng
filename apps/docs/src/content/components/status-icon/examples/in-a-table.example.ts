import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatusIcon } from '@tectra-ng/ui/status-icon';

@Component({
  selector: 'status-icon-in-a-table-example',
  imports: [TxStatusIcon],
  template: `
    <table class="table">
      <caption>
        Domains
      </caption>
      <thead>
        <tr>
          <th scope="col">Domain</th>
          <th scope="col">Active</th>
          <th scope="col">SSL</th>
        </tr>
      </thead>
      <tbody>
        @for (domain of domains; track domain.name) {
          <tr>
            <td>{{ domain.name }}</td>
            <td><tx-status-icon [status]="domain.active" /></td>
            <td>
              <tx-status-icon
                [status]="domain.ssl"
                [label]="domain.ssl ? 'Certificate valid' : 'No certificate'"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatusIconInATableExample {
  readonly domains = [
    { name: 'docs.example.com', active: true, ssl: true },
    { name: 'shop.example.com', active: true, ssl: false },
    { name: 'old.example.com', active: false, ssl: false },
  ];
}
