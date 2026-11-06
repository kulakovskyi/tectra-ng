import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxFluid } from '@tectra-ng/core/fluid';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'input-states-example',
  imports: [TxFluid, TxInput],
  template: `
    <tx-fluid class="stack">
      <input txInput value="Read only" readonly aria-label="Read only" />
      <input txInput value="Disabled" disabled aria-label="Disabled" />
      <input
        txInput
        [variant]="'filled'"
        value="Filled, disabled"
        disabled
        aria-label="Filled disabled"
      />
    </tx-fluid>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputStatesExample {}
