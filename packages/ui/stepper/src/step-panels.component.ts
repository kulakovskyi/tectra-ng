import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxStepperRef } from './stepper.context';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STEPPER_ICON_DEFAULTS } from './stepper.icons';

@Component({
  selector: 'tx-step-panels',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step-panels',
    '[class]': 'stepper.passThrough().panels?.class',
    '[style]': 'stepper.passThrough().panels?.style',
  },
  viewProviders: [provideTxIconDefaults(STEPPER_ICON_DEFAULTS)],
})
export class TxStepPanels {
  protected readonly stepper = inject(TxStepperRef);
}
