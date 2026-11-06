import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSteps, TxStepsItem } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-steps-example',
  imports: [TxButton, TxSteps],
  template: `
    <tx-steps ariaLabel="Checkout" [items]="items" [(activeIndex)]="active" />
    <div class="actions">
      <button
        txButton
        severity="secondary"
        size="small"
        [disabled]="active() === 0"
        (click)="active.set(active() - 1)"
      >
        Back
      </button>
      <button
        txButton
        size="small"
        [disabled]="active() === items.length - 1"
        (click)="active.set(active() + 1)"
      >
        Next
      </button>
    </div>
  `,
  styles: `
    .actions {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperStepsExample {
  readonly active = signal(1);
  readonly items: TxStepsItem[] = [
    { label: 'Cart' },
    { label: 'Shipping' },
    { label: 'Payment' },
    { label: 'Confirmation' },
  ];
}
