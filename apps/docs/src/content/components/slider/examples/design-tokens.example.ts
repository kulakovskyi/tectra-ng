import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-design-tokens-example',
  imports: [FormsModule, TxSlider],
  template: `<tx-slider ariaLabel="Thick teal" [dt]="tokens" [(ngModel)]="value" />`,
  styles: `
    :host {
      display: block;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderDesignTokensExample {
  readonly tokens = {
    root: { trackSize: '8px', rangeBackground: '#0f766e' },
    handle: { size: '22px', borderColor: '#0f766e' },
  };
  value = 55;
}
