import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxInputMask } from '@tectra/ui/input-mask';

@Component({
  selector: 'input-mask-letters-example',
  imports: [TxInput, TxInputMask],
  template: `
    <div class="row">
      <input
        txInput
        txInputMask="aa 9999 aa"
        placeholder="AA 1234 BB"
        aria-label="Plate"
        characterPattern="[A-Za-zА-Яа-яІіЇїЄєҐґ]"
      />
      <input txInput txInputMask="****-****" placeholder="Licence key" aria-label="Licence key" />
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
export default class InputMaskLettersExample {}
