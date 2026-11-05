import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra/ui/knob';

@Component({
  selector: 'knob-step-example',
  imports: [FormsModule, TxKnob],
  template: `<tx-knob
    ariaLabel="Temperature"
    [min]="-20"
    [max]="40"
    [step]="5"
    valueTemplate="{value}°"
    [(ngModel)]="temperature"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobStepExample {
  temperature = 20;
}
