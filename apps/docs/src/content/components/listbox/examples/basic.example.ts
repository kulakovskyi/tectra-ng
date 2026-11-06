import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxListbox } from '@tectra-ng/ui/listbox';

@Component({
  selector: 'listbox-basic-example',
  imports: [TxListbox, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-listbox [options]="cities" [formControl]="city" [ariaLabel]="'City'" />
      <span class="hint">Value: {{ city.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxBasicExample {
  readonly cities = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
    { label: 'Odesa', value: 'odesa' },
    { label: 'Kharkiv', value: 'kharkiv' },
    { label: 'Dnipro', value: 'dnipro' },
  ];
  readonly city = new FormControl<string | null>('lviv');
}
