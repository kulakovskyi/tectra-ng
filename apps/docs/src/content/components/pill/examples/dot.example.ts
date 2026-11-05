import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'pill-dot-example',
  imports: [TxPill],
  template: `
    <div class="row">
      <tx-pill tone="success" [dot]="true">Online</tx-pill>
      <tx-pill tone="warn" [dot]="true">Away</tx-pill>
      <tx-pill [dot]="true">Offline</tx-pill>
      <tx-pill tone="danger" variant="outline" [dot]="true">Down</tx-pill>
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
export default class PillDotExample {}
