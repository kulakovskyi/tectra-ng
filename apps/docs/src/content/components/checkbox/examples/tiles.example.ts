import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCheckbox, TxCheckboxGroup } from '@tectra/ui/checkbox';

@Component({
  selector: 'checkbox-tiles-example',
  imports: [ReactiveFormsModule, TxCheckbox, TxCheckboxGroup],
  template: `
    <tx-checkbox-group class="tiles" [formControl]="addons" ariaLabel="Add-ons">
      <tx-checkbox
        value="backup"
        label="Daily backups"
        description="Kept for 30 days"
        [tile]="true"
      />
      <tx-checkbox
        value="ssl"
        label="Custom SSL"
        description="Bring your own certificate"
        [tile]="true"
      />
      <tx-checkbox
        value="cdn"
        label="Global CDN"
        description="Faster pages everywhere"
        [tile]="true"
      />
    </tx-checkbox-group>
  `,
  styles: `
    .tiles {
      max-width: 360px;
    }

    tx-checkbox {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxTilesExample {
  readonly addons = new FormControl<string[]>(['ssl']);
}
