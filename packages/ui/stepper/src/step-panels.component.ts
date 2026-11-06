import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxStepperRef } from './stepper.context';

@Component({
  selector: 'tx-step-panels',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step-panels',
    '[class]': 'stepper.passThrough().panels?.class',
    '[style]': 'stepper.passThrough().panels?.style',
  },
})
export class TxStepPanels {
  protected readonly stepper = inject(TxStepperRef);
}
