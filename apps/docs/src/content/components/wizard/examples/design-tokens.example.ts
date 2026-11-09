import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxWizardProgress, TxWizardStepHead } from '@tectra-ng/blocks/wizard';

@Component({
  selector: 'wizard-design-tokens-example',
  imports: [TxWizardProgress, TxWizardStepHead],
  template: `
    <div class="column">
      <tx-wizard-progress
        label="Step 3 of 4"
        [total]="4"
        [current]="2"
        [dt]="{ progress: { segmentHeight: '8px', segmentGap: '8px', currentOpacity: '0.4' } }"
      />
      <tx-wizard-step-head
        icon="send"
        title="Launch"
        lead="Everything is checked. Start when you are ready."
        [dt]="{ stepHead: { iconSize: '48px', iconFontSize: '20px', iconBorderRadius: '24px' } }"
      />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 28px;
      width: 100%;
      max-width: 532px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WizardDesignTokensExample {}
