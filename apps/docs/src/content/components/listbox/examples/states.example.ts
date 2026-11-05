import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxListbox } from '@tectra/ui/listbox';

@Component({
  selector: 'listbox-states-example',
  imports: [TxListbox, ReactiveFormsModule],
  template: `
    <div class="row">
      <tx-listbox [options]="plans" [invalid]="true" [ariaLabel]="'Invalid'" />
      <tx-listbox [options]="plans" [formControl]="locked" [ariaLabel]="'Disabled'" />
      <tx-listbox
        [options]="plans"
        [formControl]="shown"
        [readonly]="true"
        [ariaLabel]="'Read only'"
      />
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxStatesExample {
  readonly plans = ['Free', 'Team', 'Business'];
  readonly locked = new FormControl({ value: 'Team', disabled: true });
  readonly shown = new FormControl('Business');
}
