import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxField } from '@tectra-ng/ui/field';

@Component({
  selector: 'datepicker-forms-example',
  imports: [ReactiveFormsModule, TxDatePicker, TxField, TxButton],
  template: `
    <form class="form" (submit)="$event.preventDefault(); end.markAsTouched()">
      <tx-field label="Contract end" hint="dd.mm.yy, today or later" [required]="true">
        <tx-datepicker
          dateFormat="dd.mm.yy"
          [minDate]="today"
          [showIcon]="true"
          [fluid]="true"
          [formControl]="end"
        />
      </tx-field>
      <button txButton type="submit" label="Save" [disabled]="end.disabled"></button>
      <button
        txButton
        type="button"
        variant="text"
        [label]="end.disabled ? 'Enable' : 'Disable'"
        (click)="end.disabled ? end.enable() : end.disable()"
      ></button>
    </form>
  `,
  styles: `
    .form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px;
      max-width: 520px;
    }
    tx-field {
      flex: 1 1 260px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DatepickerFormsExample {
  readonly today = new Date();
  readonly end = new FormControl<Date | null>(null, Validators.required);
}
