import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox, TxCheckboxIconTemplate } from '@tectra/ui/checkbox';
import { TxIcon } from '@tectra/icons';

@Component({
  selector: 'checkbox-icon-example',
  imports: [TxCheckbox, TxCheckboxIconTemplate, TxIcon],
  template: `
    <div class="row">
      <tx-checkbox label="Times icon" icon="times" [binary]="true" />
      <tx-checkbox label="Favourite" [binary]="true">
        <ng-template txCheckboxIcon let-checked>
          @if (checked) {
            <tx-icon name="heart-fill" />
          }
        </ng-template>
      </tx-checkbox>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxIconExample {}
