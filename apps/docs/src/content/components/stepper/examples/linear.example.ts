import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import {
  TxStep,
  TxStepList,
  TxStepPanel,
  TxStepPanelContent,
  TxStepPanels,
  TxStepper,
  TxStepValue,
} from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-linear-example',
  imports: [
    FormsModule,
    TxButton,
    TxCheckbox,
    TxStepper,
    TxStepList,
    TxStep,
    TxStepPanels,
    TxStepPanel,
    TxStepPanelContent,
  ],
  template: `
    <tx-stepper [linear]="true" [(value)]="step">
      <tx-step-list>
        <tx-step value="terms">Terms</tx-step>
        <tx-step value="plan">Plan</tx-step>
        <tx-step value="done">Done</tx-step>
      </tx-step-list>
      <tx-step-panels>
        <tx-step-panel value="terms">
          <ng-template txStepPanelContent let-activate>
            <tx-checkbox
              inputId="stepper-linear-terms"
              label="I accept the terms of service"
              [binary]="true"
              [(ngModel)]="accepted"
            />
            <div class="actions">
              <button txButton [disabled]="!accepted()" (click)="activate('plan')">Continue</button>
            </div>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel value="plan">
          <ng-template txStepPanelContent let-activate>
            <p class="text">The free plan includes three projects.</p>
            <div class="actions">
              <button txButton severity="secondary" (click)="activate('terms')">Back</button>
              <button txButton (click)="activate('done')">Choose plan</button>
            </div>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel value="done">
          <ng-template txStepPanelContent let-activate>
            <p class="text">You are all set.</p>
            <div class="actions">
              <button txButton severity="secondary" (click)="activate('terms')">Start over</button>
            </div>
          </ng-template>
        </tx-step-panel>
      </tx-step-panels>
    </tx-stepper>
  `,
  styles: `
    .text {
      margin: 0;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperLinearExample {
  readonly step = signal<TxStepValue | undefined>('terms');
  readonly accepted = signal(false);
}
