import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'input-states-example',
  imports: [TxInput],
  template: `
    <div class="stack">
      <input txInput value="Read only" readonly aria-label="Read only" />
      <input txInput value="Disabled" disabled aria-label="Disabled" />
      <input txInput [variant]="'filled'" value="Filled, disabled" disabled aria-label="Filled disabled" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputStatesExample {}
