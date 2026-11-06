import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra-ng/ui/slider';

@Component({
  selector: 'slider-animate-example',
  imports: [FormsModule, TxSlider],
  template: `<tx-slider ariaLabel="Brightness" [animate]="true" [(ngModel)]="brightness" />`,
  styles: `
    :host {
      display: block;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderAnimateExample {
  brightness = 30;
}
