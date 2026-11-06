import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';

@Component({
  selector: 'checkbox-states-example',
  imports: [FormsModule, TxCheckbox],
  template: `
    <div class="row">
      <tx-checkbox label="Disabled" [disabled]="true" [binary]="true" />
      <tx-checkbox label="Disabled, checked" [disabled]="true" [ngModel]="true" />
      <tx-checkbox label="Read only" [readonly]="true" [ngModel]="true" />
      <tx-checkbox label="Invalid" [invalid]="true" [binary]="true" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxStatesExample {}
