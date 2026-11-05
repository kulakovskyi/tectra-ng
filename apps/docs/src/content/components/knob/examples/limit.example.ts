import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra/ui/knob';

@Component({
  selector: 'knob-limit-example',
  imports: [FormsModule, TxKnob],
  template: `
    <div class="row">
      <tx-knob ariaLabel="Seats on your plan" [max]="50" [limit]="20" [(ngModel)]="seats" />
      <p class="hint">Your plan allows up to 20 of 50 seats.</p>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobLimitExample {
  seats = 12;
}
