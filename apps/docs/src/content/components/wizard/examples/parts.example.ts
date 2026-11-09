import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxWizardFooter, TxWizardProgress, TxWizardStepHead } from '@tectra-ng/blocks/wizard';

@Component({
  selector: 'wizard-parts-example',
  imports: [TxWizardProgress, TxWizardStepHead, TxWizardFooter],
  template: `
    <div class="column">
      <tx-wizard-progress
        [total]="5"
        [current]="current()"
        [label]="'Step ' + (current() + 1) + ' of 5'"
      />
      <tx-wizard-step-head
        icon="building"
        title="Company details"
        badge="Optional"
        lead="We use them on invoices and in the emails your customers get."
      />
      <tx-wizard-footer
        [showBack]="current() > 0"
        [skipLabel]="current() === 2 ? 'Skip' : undefined"
        [nextLabel]="current() === 4 ? 'Finish' : 'Next'"
        [nextIcon]="current() === 4 ? 'check' : 'arrow-right'"
        [loading]="loading()"
        (back)="current.set(current() - 1)"
        (skip)="current.set(current() + 1)"
        (next)="next()"
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
export default class WizardPartsExample {
  readonly current = signal(0);
  readonly loading = signal(false);

  next(): void {
    if (this.current() < 4) {
      this.current.set(this.current() + 1);
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.current.set(0);
    }, 1200);
  }
}
