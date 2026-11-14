import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxSteps, TxStepsItem, TxStepsItemTemplate } from '@tectra-ng/ui/stepper';

@Component({
  selector: 'stepper-steps-template-example',
  imports: [TxIcon, TxSteps, TxStepsItemTemplate],
  template: `
    <tx-steps ariaLabel="Order status" [items]="items" [activeIndex]="2">
      <ng-template txStepsItem let-item let-done="done" let-active="active">
        <span class="own" [class.own--done]="done" [class.own--active]="active">
          <span class="own__marker"
            ><tx-icon [name]="done ? 'check' : active ? 'clock' : 'circle'"
          /></span>
          {{ item.label }}
        </span>
      </ng-template>
    </tx-steps>
  `,
  styles: `
    .own {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
    .own__marker {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 2px solid var(--tx-surface-border);
      border-radius: 50%;
      box-sizing: border-box;
      background: var(--tx-surface-card);
    }
    .own--done .own__marker {
      border-color: var(--tx-success-base);
      color: var(--tx-success-base);
    }
    .own--active .own__marker {
      border-color: var(--tx-primary-base);
    }
    .own--done {
      color: var(--tx-text-primary);
    }
    .own--active {
      color: var(--tx-primary-base);
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StepperStepsTemplateExample {
  readonly items: TxStepsItem[] = [
    { label: 'Ordered' },
    { label: 'Packed' },
    { label: 'Shipped' },
    { label: 'Delivered' },
  ];
}
