import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputMask } from '@tectra-ng/ui/input-mask';

@Component({
  selector: 'input-mask-card-example',
  imports: [TxInput, TxInputMask],
  template: `
    <div class="row">
      <input
        txInput
        txInputMask="9999 9999 9999 9999"
        inputmode="numeric"
        placeholder="Card number"
        aria-label="Card number"
        (completed)="card.set($event)"
      />
      <input
        txInput
        txInputMask="99/99"
        inputmode="numeric"
        placeholder="MM/YY"
        aria-label="Expiry"
        class="short"
      />
    </div>
    <p class="hint">{{ card() ? 'Card: ' + card() : 'Type 16 digits' }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .short {
      width: 96px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InputMaskCardExample {
  readonly card = signal('');
}
