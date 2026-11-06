import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-basic-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-select [options]="cities" [formControl]="city" [placeholder]="'Select a city'" />
      <span class="hint">Value: {{ city.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectBasicExample {
  cities = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
    { label: 'Odesa', value: 'odesa' },
    { label: 'Kharkiv', value: 'kharkiv' },
    { label: 'Dnipro', value: 'dnipro' },
  ];
  city = new FormControl<string | null>(null);
}
