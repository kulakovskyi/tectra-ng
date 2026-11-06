import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSteps, TxStepsItem } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-clickable-steps-example',
  imports: [TxSteps],
  template: `
    <tx-steps
      ariaLabel="Profile setup"
      [items]="items"
      [readonly]="false"
      [(activeIndex)]="active"
    />
    <p class="status">{{ status() }}</p>
  `,
  styles: `
    .status {
      margin: 16px 0 0;
      font-size: 13px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperClickableStepsExample {
  readonly active = signal(0);
  readonly status = signal('Click a step');
  readonly items: TxStepsItem[] = [
    { label: 'Personal', command: () => this.status.set('Personal details opened') },
    { label: 'Seat', command: () => this.status.set('Seat selection opened') },
    { label: 'Payment', disabled: true },
    { label: 'Confirmation', command: () => this.status.set('Confirmation opened') },
  ];
}
