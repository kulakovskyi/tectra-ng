import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStep, TxStepList, TxStepper, TxSteps, TxStepsItem } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-design-tokens-example',
  imports: [TxStepper, TxStepList, TxStep, TxSteps],
  template: `
    <tx-stepper
      [value]="2"
      [dt]="{
        stepNumber: {
          size: '32px',
          activeBackground: 'var(--tx-green-700)',
          activeBorderColor: 'var(--tx-green-700)',
          activeColor: 'var(--tx-surface-0)',
        },
        stepTitle: { activeColor: 'var(--tx-green-700)' },
        separator: { activeBackground: 'var(--tx-green-700)' },
      }"
    >
      <tx-step-list>
        <tx-step [value]="1">Upload</tx-step>
        <tx-step [value]="2">Review</tx-step>
        <tx-step [value]="3">Publish</tx-step>
      </tx-step-list>
    </tx-stepper>
    <tx-steps
      class="track"
      variant="track"
      ariaLabel="Release"
      [items]="items"
      [activeIndex]="1"
      [dt]="{ track: { markerSize: '28px', activeMarkerBackground: 'var(--tx-green-700)' } }"
    />
  `,
  styles: `
    .track {
      margin-top: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperDesignTokensExample {
  readonly items: TxStepsItem[] = [
    { label: 'Build', description: 'Compile and test' },
    { label: 'Deploy', description: 'Roll out to staging' },
    { label: 'Release', description: 'Ship to everyone' },
  ];
}
