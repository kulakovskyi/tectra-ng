import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'pill-icons-example',
  imports: [TxPill],
  template: `
    <div class="row">
      <tx-pill tone="success" icon="check-circle">Paid</tx-pill>
      <tx-pill tone="warn" icon="pi-clock">Overdue in 3 days</tx-pill>
      <tx-pill tone="danger" icon="exclamation-triangle">Failed</tx-pill>
      <tx-pill tone="info" icon="globe">Public</tx-pill>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillIconsExample {}
