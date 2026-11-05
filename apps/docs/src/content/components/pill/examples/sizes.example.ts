import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'pill-sizes-example',
  imports: [TxPill],
  template: `
    <div class="row">
      <tx-pill size="small" tone="primary" icon="tag">Small</tx-pill>
      <tx-pill tone="primary" icon="tag">Medium</tx-pill>
      <tx-pill size="large" tone="primary" icon="tag">Large</tx-pill>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillSizesExample {}
