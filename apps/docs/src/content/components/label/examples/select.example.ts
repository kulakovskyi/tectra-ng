import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxFloatLabel, TxIftaLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'label-select-example',
  imports: [TxFloatLabel, TxIftaLabel, TxSelect, ReactiveFormsModule],
  template: `
    <div class="row">
      <tx-float-label [variant]="'on'">
        <tx-select inputId="label-select-city" [options]="cities" [formControl]="city" />
        <label for="label-select-city">City</label>
      </tx-float-label>
      <tx-ifta-label>
        <tx-select inputId="label-select-plan" [options]="plans" [formControl]="plan" />
        <label for="label-select-plan">Plan</label>
      </tx-ifta-label>
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 260px));
      gap: 16px;
      padding-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LabelSelectExample {
  readonly cities = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
  ];
  readonly plans = [
    { label: 'Free', value: 'free' },
    { label: 'Team', value: 'team' },
  ];
  readonly city = new FormControl<string | null>(null);
  readonly plan = new FormControl('team');
}
