import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import {
  TxStep,
  TxStepContent,
  TxStepList,
  TxStepPanel,
  TxStepPanels,
  TxStepper,
  TxStepValue,
} from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-step-template-example',
  imports: [TxIcon, TxStepper, TxStepList, TxStep, TxStepContent, TxStepPanels, TxStepPanel],
  template: `
    <tx-stepper [(value)]="step">
      <tx-step-list>
        @for (item of steps; track item.value) {
          <tx-step [value]="item.value">
            <ng-template
              txStepContent
              let-value
              let-active="active"
              let-completed="completed"
              let-activate="activate"
            >
              <button
                type="button"
                class="own-step"
                [class.own-step--on]="active || completed"
                role="tab"
                [attr.aria-selected]="active"
                [attr.aria-current]="active ? 'step' : null"
                [attr.aria-label]="item.label"
                (click)="activate(value)"
              >
                <tx-icon [name]="item.icon" />
              </button>
            </ng-template>
          </tx-step>
        }
      </tx-step-list>
      <tx-step-panels>
        @for (item of steps; track item.value) {
          <tx-step-panel [value]="item.value">{{ item.label }}: {{ item.text }}</tx-step-panel>
        }
      </tx-step-panels>
    </tx-stepper>
  `,
  styles: `
    .own-step {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 2px solid var(--tx-surface-border);
      border-radius: 50%;
      background: var(--tx-surface-card);
      color: var(--tx-text-muted);
      cursor: pointer;
      transition:
        background-color var(--tx-motion-duration),
        color var(--tx-motion-duration),
        border-color var(--tx-motion-duration);
    }
    .own-step--on {
      border-color: var(--tx-primary-base);
      background: var(--tx-primary-base);
      color: var(--tx-primary-contrast);
    }
    .own-step:focus-visible {
      outline: 2px solid var(--tx-focus-ring-color);
      outline-offset: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperStepTemplateExample {
  readonly step = signal<TxStepValue | undefined>('account');
  readonly steps = [
    { value: 'account', label: 'Account', icon: 'user', text: 'email and password.' },
    { value: 'address', label: 'Address', icon: 'id-card', text: 'where we send the order.' },
    { value: 'payment', label: 'Payment', icon: 'credit-card', text: 'card details.' },
  ] as const;
}
