import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxKnob } from '@tectra-ng/ui/knob';

@Component({
  selector: 'knob-value-template-example',
  imports: [FormsModule, TxKnob],
  template: `<tx-knob
    ariaLabel="Disk used"
    [max]="2000"
    [step]="50"
    valueTemplate="{value} GB"
    [(ngModel)]="disk"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class KnobValueTemplateExample {
  disk = 1250;
}
