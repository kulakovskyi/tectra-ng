import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRadioButton, TxRadioGroup } from '@tectra-ng/ui/radio-button';

@Component({
  selector: 'radio-button-tiles-example',
  imports: [FormsModule, TxRadioGroup, TxRadioButton],
  template: `
    <tx-radio-group class="plans" orientation="horizontal" ariaLabel="Plan" [(ngModel)]="plan">
      @for (option of plans; track option.value) {
        <tx-radio-button
          [value]="option.value"
          [label]="option.label"
          [description]="option.price"
          [tile]="true"
        />
      }
    </tx-radio-group>
  `,
  styles: `
    .plans tx-radio-button {
      flex: 1 1 160px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadioButtonTilesExample {
  readonly plans = [
    { value: 'free', label: 'Free', price: '$0 / month' },
    { value: 'team', label: 'Team', price: '$12 / seat' },
    { value: 'scale', label: 'Scale', price: 'Talk to us' },
  ];
  plan = 'team';
}
