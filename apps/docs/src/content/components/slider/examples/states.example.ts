import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-states-example',
  imports: [FormsModule, TxSlider],
  template: `
    <div class="list">
      <tx-slider ariaLabel="Read only" [readonly]="true" [ngModel]="60" />
      <tx-slider ariaLabel="Disabled" [disabled]="true" [ngModel]="35" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderStatesExample {}
