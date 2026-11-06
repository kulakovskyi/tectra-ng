import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-ring-example',
  imports: [FormsModule, TxKnob],
  template: `<tx-knob
    arc="ring"
    ariaLabel="Progress"
    valueTemplate="{value}%"
    [size]="140"
    [(ngModel)]="progress"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobRingExample {
  progress = 65;
}
