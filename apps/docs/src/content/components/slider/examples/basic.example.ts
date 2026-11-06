import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'slider-basic-example',
  imports: [FormsModule, TxSlider],
  template: `
    <tx-slider ariaLabel="Volume" [(ngModel)]="volume" />
    <p class="hint">Value: {{ volume }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderBasicExample {
  volume = 40;
}
