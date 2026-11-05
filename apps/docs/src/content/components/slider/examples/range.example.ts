import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-range-example',
  imports: [FormsModule, TxSlider],
  template: `
    <tx-slider
      ariaLabel="Price"
      [range]="true"
      [max]="1000"
      [step]="10"
      [minStepsBetweenHandles]="5"
      [(ngModel)]="price"
    />
    <p class="hint">\${{ price[0] }} – \${{ price[1] }}</p>
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
