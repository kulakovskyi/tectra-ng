import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxSelectButton, TxSelectButtonItemTemplate } from '@tectra-ng/ui/select-button';

interface Plan {
  name: string;
  price: string;
  icon: string;
}

@Component({
  selector: 'select-button-template-example',
  imports: [TxSelectButton, TxSelectButtonItemTemplate, TxIcon],
  template: `
    <tx-select-button
      ariaLabel="Plan"
      optionLabel="name"
      optionValue="name"
      [options]="plans"
      [(value)]="plan"
    >
      <ng-template txSelectButtonItem [txSelectButtonItemOf]="plans" let-plan>
        <span class="plan">
          <tx-icon [name]="plan.icon" />
          <span class="plan__text">
            <span>{{ plan.name }}</span>
            <span class="plan__price">{{ plan.price }}</span>
          </span>
        </span>
      </ng-template>
    </tx-select-button>
  `,
  styles: `
    .plan {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 2px 4px;
    }
    .plan__text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .plan__price {
      font-size: var(--tx-font-size-xs);
      font-weight: var(--tx-font-weight-regular);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonTemplateExample {
  readonly plans: Plan[] = [
    { name: 'Starter', price: 'Free', icon: 'user' },
    { name: 'Team', price: '$12 / seat', icon: 'users' },
    { name: 'Business', price: '$29 / seat', icon: 'building' },
  ];
  readonly plan = signal<unknown>('Team');
}
