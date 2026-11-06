import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxStep, TxStepList, TxStepPanel, TxStepPanels, TxStepper } from '@tectra-ng/ui/stepper';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'stepper-disabled-step-example',
  imports: [FormsModule, TxStepper, TxStepList, TxStep, TxStepPanels, TxStepPanel, TxToggleSwitch],
  template: `
    <tx-toggle-switch class="option" label="Paid plan" [(ngModel)]="paid" />
    <tx-stepper [value]="1">
      <tx-step-list>
        <tx-step [value]="1">Profile</tx-step>
        <tx-step [value]="2">Team</tx-step>
        <tx-step [value]="3" [disabled]="!paid()">Billing</tx-step>
      </tx-step-list>
      <tx-step-panels>
        <tx-step-panel [value]="1">Your name and photo.</tx-step-panel>
        <tx-step-panel [value]="2">People who can open the projects.</tx-step-panel>
        <tx-step-panel [value]="3">Card and invoices.</tx-step-panel>
      </tx-step-panels>
    </tx-stepper>
  `,
  styles: `
    .option {
      margin-bottom: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperDisabledStepExample {
  readonly paid = signal(false);
}
