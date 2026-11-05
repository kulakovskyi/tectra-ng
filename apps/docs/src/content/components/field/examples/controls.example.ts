import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxField } from '@tectra/ui/field';
import { TxIconField, TxInputIcon } from '@tectra/ui/icon-field';
import { TxInput } from '@tectra/ui/input';
import { TxInputGroup, TxInputGroupAddon } from '@tectra/ui/input-group';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'field-controls-example',
  imports: [TxField, TxInput, TxSelect, TxIconField, TxInputIcon, TxInputGroup, TxInputGroupAddon],
  template: `
    <div class="form">
      <tx-field label="Search">
        <tx-icon-field [fluid]="true">
          <tx-input-icon icon="search" />
          <input txInput placeholder="Pages, people, files" />
        </tx-icon-field>
      </tx-field>
      <tx-field label="Website">
        <tx-input-group>
          <tx-input-group-addon>https://</tx-input-group-addon>
          <input txInput placeholder="example.com" />
        </tx-input-group>
      </tx-field>
      <tx-field label="Role">
        <tx-select [options]="roles" placeholder="Choose a role" />
      </tx-field>
      <tx-field label="About" hint="A few words for your profile.">
        <textarea txInput rows="3" [fluid]="true"></textarea>
      </tx-field>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      gap: 16px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FieldControlsExample {
  readonly roles = [
    { label: 'Owner', value: 'owner' },
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ];
}
