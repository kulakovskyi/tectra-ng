import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra/ui/knob';

@Component({
  selector: 'knob-design-tokens-example',
  imports: [FormsModule, TxKnob],
  template: `<tx-knob
    ariaLabel="Teal knob"
    [dt]="tokens"
    [strokeWidth]="16"
    [(ngModel)]="value"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobDesignTokensExample {
  readonly tokens = {
    root: { valueColor: '#0f766e', rangeColor: '#ccfbf1', textColor: '#115e59' },
  };
  value = 55;
}
