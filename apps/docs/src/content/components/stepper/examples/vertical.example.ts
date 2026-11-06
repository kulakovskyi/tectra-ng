import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxStep,
  TxStepItem,
  TxStepPanel,
  TxStepPanelContent,
  TxStepper,
  TxStepValue,
} from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-vertical-example',
  imports: [TxButton, TxStepper, TxStepItem, TxStep, TxStepPanel, TxStepPanelContent],
  template: `
    <tx-stepper [(value)]="step">
      <tx-step-item value="domain">
        <tx-step>Add the domain</tx-step>
        <tx-step-panel>
          <ng-template txStepPanelContent let-activate>
            <p class="text">Enter the domain you own, without www.</p>
            <button txButton size="small" (click)="activate('dns')">Next</button>
          </ng-template>
        </tx-step-panel>
      </tx-step-item>
      <tx-step-item value="dns">
        <tx-step>Update DNS records</tx-step>
        <tx-step-panel>
          <ng-template txStepPanelContent let-activate>
            <p class="text">Point the A record to 203.0.113.10 at your registrar.</p>
            <div class="actions">
              <button txButton size="small" severity="secondary" (click)="activate('domain')">
                Back
              </button>
              <button txButton size="small" (click)="activate('verify')">Next</button>
            </div>
          </ng-template>
        </tx-step-panel>
      </tx-step-item>
      <tx-step-item value="verify">
        <tx-step>Verify</tx-step>
        <tx-step-panel>
          <ng-template txStepPanelContent let-activate>
            <p class="text">Checks usually pass within a few minutes.</p>
            <button txButton size="small" severity="secondary" (click)="activate('dns')">
              Back
            </button>
          </ng-template>
        </tx-step-panel>
      </tx-step-item>
    </tx-stepper>
  `,
  styles: `
    .text {
      margin: 0 0 12px;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperVerticalExample {
  readonly step = signal<TxStepValue | undefined>('domain');
}
