import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput } from '@tectra/ui/chips-input';

@Component({
  selector: 'chips-input-pass-through-example',
  imports: [TxChipsInput, ReactiveFormsModule],
  template: `<tx-chips-input [formControl]="tags" [pt]="pt" [ariaLabel]="'Tags'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputPassThroughExample {
  readonly tags = new FormControl(['bold', 'chips']);
  readonly pt = {
    chip: { style: { fontWeight: '600' } },
    input: { style: { fontStyle: 'italic' } },
  };
}
