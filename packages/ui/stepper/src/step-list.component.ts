import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxStepperRef } from './stepper.context';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STEPPER_ICON_DEFAULTS } from './stepper.icons';

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
  viewProviders: [provideTxIconDefaults(STEPPER_ICON_DEFAULTS)],
})
export class TxStepList {
  protected readonly stepper = inject(TxStepperRef);
}
