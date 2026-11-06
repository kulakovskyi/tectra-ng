import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';

@Component({
  selector: 'input-number-basic-example',
  imports: [FormsModule, TxInputNumber],
  template: `
    <tx-input-number ariaLabel="Visitors" placeholder="Visitors" [(ngModel)]="visitors" />
    <p class="hint">Model: {{ visitors ?? 'null' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputNumberBasicExample {
  visitors: number | null = 1250000;
}
