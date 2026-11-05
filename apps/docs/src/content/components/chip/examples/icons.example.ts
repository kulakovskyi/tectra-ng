import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChip } from '@tectra/ui/chip';

@Component({
  selector: 'chip-icons-example',
  imports: [TxChip],
  template: `
    <div class="row">
      <tx-chip icon="map-marker" label="Kyiv" />
      <tx-chip icon="calendar" label="This week" />
      <tx-chip icon="filter" label="Paid only" />
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
export default class ChipIconsExample {}
