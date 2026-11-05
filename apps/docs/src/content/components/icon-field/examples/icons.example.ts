import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIconField, TxInputIcon } from '@tectra/ui/icon-field';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'icon-field-icons-example',
  imports: [TxIconField, TxInputIcon, TxInput],
  template: `
    <div class="stack">
      <tx-icon-field>
        <tx-input-icon [icon]="'search'" />
        <input txInput placeholder="Search" aria-label="Search" />
      </tx-icon-field>
      <tx-icon-field>
        <input txInput placeholder="Email" aria-label="Email" />
        <tx-input-icon position="end" [icon]="'envelope'" />
      </tx-icon-field>
      <tx-icon-field>
        <tx-input-icon [icon]="'user'" />
        <input txInput placeholder="Both sides" aria-label="Both sides" />
        <tx-input-icon position="end" [icon]="'check'" />
      </tx-icon-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class IconFieldIconsExample {}
