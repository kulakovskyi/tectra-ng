import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxStep, TxStepList, TxStepper, TxStepValue } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-completed-example',
  imports: [TxStepper, TxStepList, TxStep],
  template: `
    <tx-stepper [(value)]="step">
      <tx-step-list>
        <tx-step value="details" completed>Details</tx-step>
        <tx-step value="documents" [completed]="false">Documents</tx-step>
        <tx-step value="payment">Payment</tx-step>
        <tx-step value="review" completed>Review</tx-step>
        <tx-step value="confirm">Confirm</tx-step>
      </tx-step-list>
    </tx-stepper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperCompletedExample {
  readonly step = signal<TxStepValue | undefined>('payment');
}
