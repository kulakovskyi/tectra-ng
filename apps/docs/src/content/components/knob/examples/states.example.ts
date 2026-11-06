import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-states-example',
  imports: [FormsModule, TxKnob],
  template: `
    <div class="row">
      <tx-knob ariaLabel="Read only" [readonly]="true" [ngModel]="60" />
      <tx-knob ariaLabel="Disabled" [disabled]="true" [ngModel]="35" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobStatesExample {}
