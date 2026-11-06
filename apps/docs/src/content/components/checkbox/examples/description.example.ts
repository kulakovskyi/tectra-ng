import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';

@Component({
  selector: 'checkbox-description-example',
  imports: [TxCheckbox],
  template: `
    <div class="list">
      <tx-checkbox
        label="Product updates"
        description="New features and improvements, once a month."
      />
      <tx-checkbox
        label="Security alerts"
        description="Sign-ins from new devices and password changes."
        [binary]="true"
      />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxDescriptionExample {}
