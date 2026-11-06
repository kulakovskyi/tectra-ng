import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxStepperRef } from './stepper.context';

@Component({
  selector: 'tx-step-list',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step-list',
    role: 'tablist',
    'aria-orientation': 'horizontal',
    '[class]': 'stepper.passThrough().list?.class',
    '[style]': 'stepper.passThrough().list?.style',
  },
})
export class TxStepList {
  protected readonly stepper = inject(TxStepperRef);
}
