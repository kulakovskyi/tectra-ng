import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'slider-step-example',
  imports: [FormsModule, TxSlider],
  template: `
    <tx-slider
      ariaLabel="Rating"
      [min]="0"
      [max]="10"
      [step]="1"
      [showSteps]="true"
      [(ngModel)]="rating"
    />
    <p class="hint">Value: {{ rating }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderStepExample {
  rating = 7;
}
