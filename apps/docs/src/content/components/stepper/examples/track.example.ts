import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSteps, TxStepsItem } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-track-example',
  imports: [TxButton, TxSteps],
  template: `
    <tx-steps variant="track" ariaLabel="Domain setup" [items]="items" [(activeIndex)]="active" />
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
        [disabled]="active() === items.length"
        (click)="active.set(active() + 1)"
      >
        {{ active() === items.length - 1 ? 'Finish' : 'Next' }}
      </button>
    </div>
  `,
  styles: `
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperTrackExample {
  readonly active = signal(1);
  readonly items: TxStepsItem[] = [
    { label: 'Domain', description: 'Name and zone' },
    { label: 'Records', description: 'Import from the registrar', icon: 'file' },
    { label: 'Security', description: 'Certificate and firewall', icon: 'lock' },
    { label: 'Launch', description: 'Go live', icon: 'send' },
  ];
}
