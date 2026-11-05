import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-invalid-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `<tx-select
    [options]="plans"
    [formControl]="plan"
    [placeholder]="'Plan (required)'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectInvalidExample {
  readonly plans = [
    { label: 'Free', value: 'free' },
    { label: 'Team', value: 'team' },
  ];
  readonly plan = new FormControl<string | null>(null, Validators.required);
}
