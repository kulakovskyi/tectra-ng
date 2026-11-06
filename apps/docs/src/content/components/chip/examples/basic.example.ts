import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChip } from '@tectra-ng/ui/chip';

@Component({
  selector: 'chip-basic-example',
  imports: [TxChip],
  template: `
    <div class="row">
      <tx-chip label="Design" />
      <tx-chip label="Product" />
      <tx-chip label="Engineering" />
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
export default class ChipBasicExample {}
