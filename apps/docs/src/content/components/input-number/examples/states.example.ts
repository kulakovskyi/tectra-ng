import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-states-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Disabled" [disabled]="true" [showButtons]="true" [ngModel]="12" />
      <tx-input-number
        ariaLabel="Read only"
        [readonly]="true"
        [showButtons]="true"
        [ngModel]="12"
      />
      <tx-input-number ariaLabel="Invalid" [invalid]="true" placeholder="Invalid" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberStatesExample {}
