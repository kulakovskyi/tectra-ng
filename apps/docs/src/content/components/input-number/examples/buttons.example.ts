import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-buttons-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <div class="row">
      <tx-input-number ariaLabel="Stacked" [showButtons]="true" [(ngModel)]="stacked" />
      <tx-input-number
        ariaLabel="Horizontal"
        [showButtons]="true"
        buttonLayout="horizontal"
        [min]="0"
        [(ngModel)]="horizontal"
        class="narrow"
      />
      <tx-input-number
        ariaLabel="Vertical"
        [showButtons]="true"
        buttonLayout="vertical"
        [min]="0"
        [max]="10"
        [(ngModel)]="vertical"
        class="tiny"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }

    .narrow {
      width: 160px;
    }

    .tiny {
      width: 64px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberButtonsExample {
  stacked = 20;
  horizontal = 3;
  vertical = 5;
}
