import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxField } from '@tectra-ng/ui/field';
import { TxListbox } from '@tectra-ng/ui/listbox';

@Component({
  selector: 'listbox-field-example',
  imports: [TxField, TxListbox, ReactiveFormsModule],
  template: `
    <tx-field [label]="'Notification days'" [hint]="'Pick at least one day'">
      <tx-listbox [options]="days" [formControl]="selected" [checkbox]="true" />
    </tx-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxFieldExample {
  readonly days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  readonly selected = new FormControl<string[]>([], Validators.required);
}
