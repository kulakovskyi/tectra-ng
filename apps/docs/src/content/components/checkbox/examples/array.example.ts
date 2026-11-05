import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-array-example',
  imports: [ReactiveFormsModule, JsonPipe, TxCheckbox],
  template: `
    <div class="row">
      @for (day of days; track day) {
        <tx-checkbox [value]="day" [label]="day" [formControl]="selected" />
      }
    </div>
    <p class="hint">Value: {{ selected.value | json }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxArrayExample {
  readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  readonly selected = new FormControl<string[]>(['Mon', 'Wed']);
}
