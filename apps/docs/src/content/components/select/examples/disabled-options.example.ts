import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-disabled-options-example',
  imports: [TxSelect],
  template: `<tx-select [options]="plans" [optionDisabled]="'soldOut'" [placeholder]="'Plan'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectDisabledOptionsExample {
  readonly plans = [
    { label: 'Starter', value: 'starter' },
    { label: 'Team — no seats left', value: 'team', soldOut: true },
    { label: 'Business', value: 'business' },
    { label: 'Enterprise — on request', value: 'enterprise', soldOut: true },
  ];
}
