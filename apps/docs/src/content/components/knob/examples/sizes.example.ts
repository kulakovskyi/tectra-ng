import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra/ui/knob';

@Component({
  selector: 'knob-sizes-example',
  imports: [FormsModule, TxKnob],
  template: `
    <div class="row">
      <tx-knob ariaLabel="Small" [size]="64" [strokeWidth]="10" [ngModel]="30" />
      <tx-knob ariaLabel="Medium" [ngModel]="50" />
      <tx-knob ariaLabel="Large" [size]="160" [strokeWidth]="8" [ngModel]="70" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobSizesExample {}
