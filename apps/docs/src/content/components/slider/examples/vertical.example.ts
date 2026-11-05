import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxSlider } from '@tectra/ui/slider';

@Component({
  selector: 'slider-vertical-example',
  imports: [FormsModule, TxSlider],
  template: `
    <div class="row">
      <tx-slider orientation="vertical" ariaLabel="Bass" [(ngModel)]="bass" />
      <tx-slider orientation="vertical" ariaLabel="Mid" [(ngModel)]="mid" />
      <tx-slider orientation="vertical" ariaLabel="Treble" [(ngModel)]="treble" />
      <tx-slider orientation="vertical" ariaLabel="Band" [range]="true" [(ngModel)]="band" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderVerticalExample {
  bass = 60;
  mid = 45;
  treble = 70;
  band: [number, number] = [30, 80];
}
