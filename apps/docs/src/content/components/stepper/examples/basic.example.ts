import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';
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
  selector: 'stepper-basic-example',
  imports: [
    FormsModule,
    TxButton,
    TxField,
    TxInput,
    TxStepper,
    TxStepList,
    TxStep,
    TxStepPanels,
    TxStepPanel,
    TxStepPanelContent,
  ],
  template: `
    <tx-stepper [(value)]="step">
      <tx-step-list>
        <tx-step [value]="1">Workspace</tx-step>
        <tx-step [value]="2">Members</tx-step>
        <tx-step [value]="3">Review</tx-step>
      </tx-step-list>
      <tx-step-panels>
        <tx-step-panel [value]="1">
          <ng-template txStepPanelContent let-activate>
            <tx-field label="Workspace name">
              <input txInput id="stepper-basic-name" [fluid]="true" [(ngModel)]="name" />
            </tx-field>
            <div class="actions">
              <button txButton icon="arrow-right" iconPos="right" (click)="activate(2)">
                Next
              </button>
            </div>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel [value]="2">
          <ng-template txStepPanelContent let-activate>
            <tx-field label="Invite by email">
              <input txInput id="stepper-basic-email" [fluid]="true" [(ngModel)]="email" />
            </tx-field>
            <div class="actions">
              <button txButton severity="secondary" icon="arrow-left" (click)="activate(1)">
                Back
              </button>
              <button txButton icon="arrow-right" iconPos="right" (click)="activate(3)">
                Next
              </button>
            </div>
          </ng-template>
        </tx-step-panel>
        <tx-step-panel [value]="3">
          <ng-template txStepPanelContent let-activate>
            <p class="summary">
              Create <b>{{ name() || 'Untitled' }}</b> and invite {{ email() || 'nobody yet' }}.
            </p>
            <div class="actions">
              <button txButton severity="secondary" icon="arrow-left" (click)="activate(2)">
                Back
              </button>
              <button txButton icon="check" (click)="step.set(1)">Create</button>
            </div>
          </ng-template>
        </tx-step-panel>
      </tx-step-panels>
    </tx-stepper>
  `,
  styles: `
    .actions {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-top: 16px;
    }
    .actions:has(> :only-child) {
      justify-content: flex-end;
    }
    .summary {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperBasicExample {
  readonly step = signal<TxStepValue | undefined>(1);
  readonly name = signal('');
  readonly email = signal('');
}
