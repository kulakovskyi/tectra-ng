import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-disabled-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `<tx-select [options]="plans" [formControl]="plan" [ariaLabel]="'Plan'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectDisabledExample {
  plans = [{ label: 'Free', value: 'free' }];
  plan = new FormControl({ value: 'free', disabled: true });
}
