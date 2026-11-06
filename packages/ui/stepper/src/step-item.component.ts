import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TxStepperRef } from './stepper.context';
import { TxStepValue } from './stepper.types';

@Component({
  selector: 'tx-step-item',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step-item',
    '[class]': 'stepper.passThrough().item?.class',
    '[style]': 'stepper.passThrough().item?.style',
    '[class.tx-step-item--active]': 'active()',
    '[class.tx-step-item--completed]': 'completed()',
    '[class.tx-step-item--last]': 'last()',
  },
})
export class TxStepItem {
  protected readonly stepper = inject(TxStepperRef);

  readonly value = input.required<TxStepValue>();

  readonly active = computed(() => this.stepper.isActive(this.value()));
  readonly completed = computed(() => this.stepper.isCompleted(this.value()));
  readonly last = computed(() => this.stepper.isLast(this.value()));
}
