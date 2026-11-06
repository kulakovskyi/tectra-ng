import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-basic-example',
  imports: [FormsModule, TxKnob],
  template: `
    <tx-knob ariaLabel="Volume" [(ngModel)]="volume" />
    <p class="hint">Value: {{ volume }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobBasicExample {
  volume = 40;
}
