import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra-ng/ui/card';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'card-grid-example',
  imports: [TxCard, TxButton],
  template: `
    <div class="grid">
      @for (plan of plans; track plan.name) {
        <tx-card [title]="plan.name" [subtitle]="plan.price">
          {{ plan.text }}
          <button
            txButton
            txCardFooter
            [variant]="plan.name === 'Team' ? undefined : 'outlined'"
            [fluid]="true"
          >
            Choose {{ plan.name }}
          </button>
        </tx-card>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardGridExample {
  readonly plans = [
    { name: 'Free', price: '$0', text: 'One project and three members.' },
    {
      name: 'Team',
      price: '$12 a member',
      text: 'Unlimited projects, roles and shared folders for the whole team.',
    },
    { name: 'Business', price: '$24 a member', text: 'Single sign-on and an audit log.' },
  ];
}
