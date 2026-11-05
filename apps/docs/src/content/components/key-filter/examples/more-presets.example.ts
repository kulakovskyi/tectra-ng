import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFluid } from '@tectra/core/fluid';
import { TxInput } from '@tectra/ui/input';
import { TxKeyFilter } from '@tectra/ui/key-filter';

@Component({
  selector: 'key-filter-more-presets-example',
  imports: [TxFluid, TxInput, TxKeyFilter],
  template: `
    <tx-fluid class="stack">
      <input txInput [txKeyFilter]="'latin'" [keyFilterExtra]="'-_'" placeholder="Latin, - and _ only" aria-label="Latin" />
      <input txInput [txKeyFilter]="'positive'" placeholder="Positive number, one separator" aria-label="Positive" />
      <input txInput [txKeyFilter]="'nospace'" placeholder="No spaces" aria-label="No spaces" />
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KeyFilterMorePresetsExample {}
