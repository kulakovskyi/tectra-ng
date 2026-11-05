import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-variants-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-select [options]="cities" [variant]="'filled'" [placeholder]="'Filled'" />
      <tx-select [options]="cities" [readonly]="true" [formControl]="city" [ariaLabel]="'Read only'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectVariantsExample {
  readonly cities = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
  ];
  readonly city = new FormControl('kyiv');
}
