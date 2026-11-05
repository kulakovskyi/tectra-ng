import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider, TxSliderMark } from '@tectra/ui/slider';

@Component({
  selector: 'slider-marks-example',
  imports: [FormsModule, TxSlider],
  template: `<tx-slider
    ariaLabel="Plan size"
    [min]="1"
    [max]="5"
    [step]="1"
    [marks]="marks"
    valueTemplate="{value} seats tier"
    [(ngModel)]="tier"
  />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderMarksExample {
  readonly marks: TxSliderMark[] = [
    { value: 1, label: 'Solo' },
    { value: 2, label: 'Duo' },
    { value: 3, label: 'Team' },
    { value: 4, label: 'Studio' },
    { value: 5, label: 'Agency' },
  ];
  tier = 3;
}
