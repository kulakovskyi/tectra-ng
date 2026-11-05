import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-editable-example',
  imports: [TxSelect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-select
        [options]="units"
        [formControl]="unit"
        [editable]="true"
        [placeholder]="'Unit, or type your own'"
        [ariaLabel]="'Unit'"
      />
      <span class="hint">Value: {{ unit.value ?? '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectEditableExample {
  readonly units = [
    { label: 'Pieces', value: 'pcs' },
    { label: 'Kilograms', value: 'kg' },
    { label: 'Litres', value: 'l' },
    { label: 'Metres', value: 'm' },
  ];
  readonly unit = new FormControl<string | null>(null);
}
