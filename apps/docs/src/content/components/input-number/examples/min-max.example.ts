import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra/ui/input-number';

@Component({
  selector: 'input-number-min-max-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <tx-input-number
      ariaLabel="Seats, 1 to 50"
      [showButtons]="true"
      [min]="1"
      [max]="50"
      [(ngModel)]="seats"
    />
    <tx-input-number
      ariaLabel="Rate, step 0.25"
      [showButtons]="true"
      [min]="0"
      [max]="5"
      [step]="0.25"
      [minFractionDigits]="2"
      [(ngModel)]="rate"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberMinMaxExample {
  seats = 49;
  rate = 2.5;
}
