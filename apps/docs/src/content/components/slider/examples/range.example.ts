import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxAmount } from '@tectra-ng/ui/amount';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'slider-range-example',
  imports: [FormsModule, TxSlider, TxAmount],
  template: `
    <tx-slider
      ariaLabel="Price"
      [range]="true"
      [max]="1000"
      [step]="10"
      [minStepsBetweenHandles]="5"
      [(ngModel)]="price"
    />
    <p class="hint">
      <tx-amount currency="USD" format="1.0-0" [amount]="price[0]" /> –
      <tx-amount currency="USD" format="1.0-0" [amount]="price[1]" />
    </p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderRangeExample {
  price: [number, number] = [200, 650];
}
