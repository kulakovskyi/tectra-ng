import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'sandbox-root',
  imports: [TxSelect, TxButton, TxInput],
  template: `
    <div style="display: grid; gap: 12px; max-width: 320px; padding: 32px; font-family: system-ui">
      <input txInput placeholder="Try me" />
      <tx-select [options]="options" [placeholder]="'Pick one'" [filter]="true" />
      <button txButton>Button</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  options = [
    { label: 'One', value: 1 },
    { label: 'Two', value: 2 },
  ];
}
