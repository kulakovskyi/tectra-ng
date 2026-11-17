import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxKnob } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-basic-example',
  imports: [TxKnob],
  template: `
    <tx-knob ariaLabel="Volume" [(value)]="volume" />
    <p class="hint">Value: {{ volume() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobBasicExample {
  readonly volume = signal<number | null>(40);
}
