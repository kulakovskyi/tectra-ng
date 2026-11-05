import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInputNumber } from '@tectra/ui/input-number';

@Component({
  selector: 'input-number-sizes-example',
  imports: [TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number size="small" ariaLabel="Small" placeholder="Small" [showButtons]="true" />
      <tx-input-number ariaLabel="Medium" placeholder="Medium" [showButtons]="true" />
      <tx-input-number size="large" ariaLabel="Large" placeholder="Large" [showButtons]="true" />
      <tx-input-number
        variant="filled"
        ariaLabel="Filled"
        placeholder="Filled"
        [showButtons]="true"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberSizesExample {}
