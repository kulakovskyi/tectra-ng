import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-states-example',
  imports: [TxChipsInput, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-chips-input [size]="'small'" [placeholder]="'Small'" />
      <tx-chips-input [variant]="'filled'" [placeholder]="'Filled'" />
      <tx-chips-input [size]="'large'" [placeholder]="'Large'" />
      <tx-chips-input [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-chips-input [formControl]="shown" [readonly]="true" [ariaLabel]="'Read only'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputStatesExample {
  readonly locked = new FormControl({ value: ['locked'], disabled: true });
  readonly shown = new FormControl(['shown', 'only']);
}
