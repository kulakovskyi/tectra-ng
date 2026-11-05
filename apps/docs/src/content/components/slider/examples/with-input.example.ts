import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra/ui/input-number';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-with-input-example',
  imports: [ReactiveFormsModule, TxSlider, TxInputNumber],
  template: `
    <div class="row">
      <tx-slider ariaLabel="Opacity" [formControl]="opacity" class="grow" />
      <tx-input-number
        ariaLabel="Opacity"
        suffix="%"
        [min]="0"
        [max]="100"
        [formControl]="opacity"
        class="input"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 420px;
    }

    .grow {
      flex: 1;
    }

    .input {
      width: 90px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderWithInputExample {
  readonly opacity = new FormControl<number | null>(80);
}
